const router = require('express').Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Listing = require('../models/Listing');
const { requireAuth } = require('../middleware/auth');
const { uploadToS3 } = require('../services/s3');
const { sendContactEmail } = require('../services/email');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many requests' } });

const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

// GET /api/listings — public browse with filters + pagination
router.get('/', async (req, res) => {
  try {
    const { q, brand, make, model, series, condition, rarity, isLimitedEdition, minPrice, maxPrice, sort, page = 1, limit = 24 } = req.query;

    const query = { status: 'published' };
    if (q) {
      const re = new RegExp(q, 'i');
      query.$or = [
        { title: re }, { brand: re }, { make: re }, { model: re },
        { series: re }, { description: re }, { aiNotes: re },
      ];
    }
    if (brand) query.brand = brand;
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (series) query.series = new RegExp(series, 'i');
    if (condition) query.condition = condition;
    if (rarity) query.rarity = rarity;
    if (isLimitedEdition !== undefined) query.isLimitedEdition = isLimitedEdition === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortObj = SORT_MAP[sort] || SORT_MAP.newest;
    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(query).sort(sortObj).skip(skip).limit(Number(limit)).populate('seller', 'name profilePhoto'),
      Listing.countDocuments(query),
    ]);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/meta/filters — must be before /:id to avoid route shadowing
router.get('/meta/filters', async (req, res) => {
  try {
    const [brands, series, conditions, rarities] = await Promise.all([
      Listing.distinct('brand', { status: 'published', brand: { $ne: '' } }),
      Listing.distinct('series', { status: 'published', series: { $ne: '' } }),
      Listing.distinct('condition', { status: 'published', condition: { $ne: '' } }),
      Listing.distinct('rarity', { status: 'published', rarity: { $ne: '' } }),
    ]);
    res.json({ brands, series, conditions, rarities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings/:id/sold — mark sold (owner only)
router.post('/:id/sold', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    listing.status = 'draft';
    listing.isSold = true;
    await listing.save();
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings/:id/relist — re-publish (owner only)
router.post('/:id/relist', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    listing.status = 'published';
    listing.isSold = false;
    await listing.save();
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/:id — public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name profilePhoto email');
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.status === 'draft' && (!req.user || !req.user._id.equals(listing.seller._id))) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings — create (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/listings/:id — update (owner only)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    Object.assign(listing, req.body);
    await listing.save();
    res.json({ listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/listings/:id — owner only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    await listing.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings/:id/photos — upload listing photo to S3
router.post('/:id/photos', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = await uploadToS3(req.file);
    listing.photos.push(url);
    await listing.save();
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings/:id/contact — buyer contacts seller
router.post('/:id/contact', requireAuth, contactLimiter, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email');
    if (!listing || listing.status !== 'published') return res.status(404).json({ error: 'Not found' });
    if (!listing.seller.email) return res.status(422).json({ error: 'Seller has no contact email on file.' });
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });
    await sendContactEmail({
      listing,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      message,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
