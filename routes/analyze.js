const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const { requireAuth } = require('../middleware/auth');
const { analyzeCarPhoto } = require('../services/openai');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
    cb(null, true);
  },
});

router.post('/', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    // Downsize to 512px — fits OpenAI's "low detail" threshold (85 tokens vs 1000+)
    const resized = await sharp(req.file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    const result = await analyzeCarPhoto(resized, 'image/jpeg');
    res.json({ result });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned invalid response. Please try again.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
