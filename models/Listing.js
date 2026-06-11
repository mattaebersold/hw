const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number },
  photos: [{ type: String }],
  // AI-populated / user-editable fields
  brand: { type: String, default: '' },   // Hot Wheels, Matchbox, etc.
  make: { type: String, default: '' },    // Ford, Chevy, etc.
  model: { type: String, default: '' },   // Mustang, Camaro, etc.
  series: { type: String, default: '' },
  year: { type: Number },
  condition: {
    type: String,
    enum: ['Mint in Box', 'Near Mint', 'Good', 'Fair', 'Poor', ''],
    default: '',
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Ultra Rare', ''],
    default: '',
  },
  isLimitedEdition: { type: Boolean, default: false },
  estimatedValueLow: { type: Number },
  estimatedValueHigh: { type: Number },
  aiNotes: { type: String, default: '' },
}, { timestamps: true });

listingSchema.index({ status: 1, brand: 1, make: 1, model: 1, series: 1, condition: 1, rarity: 1, price: 1 });

module.exports = mongoose.model('Listing', listingSchema);
