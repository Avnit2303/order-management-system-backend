const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  }
});

module.exports = mongoose.model('Price', priceSchema);
