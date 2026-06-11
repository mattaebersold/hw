const router = require('express').Router();
const multer = require('multer');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { requireAuth } = require('../middleware/auth');
const { uploadToS3 } = require('../services/s3');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-googleId -facebookId -email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const listings = await Listing.find({ seller: user._id, status: 'published' }).sort({ createdAt: -1 });
    res.json({ user, listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bio + social links
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { bio, socialLinks } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, socialLinks },
      { new: true, runValidators: true }
    ).select('-googleId -facebookId');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload custom profile photo to S3
router.post('/me/photo', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const url = await uploadToS3(req.file);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: url, profilePhotoIsCustom: true },
      { new: true }
    ).select('-googleId -facebookId');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
