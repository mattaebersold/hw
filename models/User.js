const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true },
  facebookId: { type: String, sparse: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  passwordHash: { type: String },
  profilePhoto: { type: String },
  profilePhotoIsCustom: { type: Boolean, default: false },
  bio: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
