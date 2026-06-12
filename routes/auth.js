const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { requireAuth } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

const safeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  socialLinks: user.socialLinks,
  watchlist: user.watchlist || [],
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=1` }),
  (req, res) => {
    if (!req.user.username) return res.redirect(`${CLIENT_URL}/onboarding`);
    res.redirect(CLIENT_URL);
  }
);

// Local register — creates account without username; onboarding sets it
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      res.status(201).json({ user: safeUser(user) });
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
      res.json({ user: safeUser(user) });
    });
  })(req, res, next);
});

// Set username + bio after registration (Google or local)
router.post('/onboard', requireAuth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Username must be 3–20 characters (letters, numbers, underscores)' });
    }
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing && !existing._id.equals(req.user._id)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.toLowerCase(), bio: bio?.trim() || '' },
      { new: true }
    );
    res.json({ user: safeUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username already taken' });
    res.status(500).json({ error: err.message });
  }
});

// Current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: safeUser(req.user) });
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
