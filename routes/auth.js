const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { requireAuth } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=1` }),
  (req, res) => res.redirect(CLIENT_URL)
);

// Local register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      const { _id, name: n, email: e, profilePhoto, bio, socialLinks } = user;
      res.status(201).json({ user: { _id, name: n, email: e, profilePhoto, bio, socialLinks } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { _id, name, email, profilePhoto, bio, socialLinks } = user;
      res.json({ user: { _id, name, email, profilePhoto, bio, socialLinks } });
    });
  })(req, res, next);
});

// Current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  const { _id, name, email, profilePhoto, bio, socialLinks } = req.user;
  res.json({ user: { _id, name, email, profilePhoto, bio, socialLinks } });
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(CLIENT_URL);
  });
});

// Delete account — removes user + all their listings
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Listing.deleteMany({ seller: userId }),
      User.findByIdAndDelete(userId),
    ]);
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Deleted but logout failed' });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
