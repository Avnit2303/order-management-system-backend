const Price = require('../models/Price');

// GET /api/prices — public
const getAllPrices = async (req, res, next) => {
  try {
    const prices = await Price.find().sort({ label: 1 });
    res.json(prices);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/prices — protected
const createPrice = async (req, res, next) => {
  try {
    const { label, price } = req.body;

    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ success: false, message: 'Label is required and must be a non-empty string.' });
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ success: false, message: 'Price is required and must be a positive number.' });
    }

    const newPrice = await Price.create({ label: label.trim(), price });
    res.status(201).json({ success: true, data: newPrice });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/prices/:id — protected
const updatePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, price } = req.body;

    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ success: false, message: 'Label is required and must be a non-empty string.' });
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ success: false, message: 'Price is required and must be a positive number.' });
    }

    const updatedPrice = await Price.findByIdAndUpdate(
      id,
      { label: label.trim(), price },
      { new: true, runValidators: true }
    );

    if (!updatedPrice) {
      return res.status(404).json({ success: false, message: 'Choice not found.' });
    }

    res.json({ success: true, data: updatedPrice });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/prices/:id — protected
const deletePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedPrice = await Price.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({ success: false, message: 'Choice not found.' });
    }

    res.json({ success: true, message: 'Choice deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPrices, createPrice, updatePrice, deletePrice };
