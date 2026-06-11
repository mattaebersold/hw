const router = require('express').Router();
const multer = require('multer');
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
    const result = await analyzeCarPhoto(req.file.buffer, req.file.mimetype);
    res.json({ result });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned invalid response. Please try again.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
