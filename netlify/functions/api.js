const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Price = require('../../models/Price');

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Routes ───────────────────────────────────────────────
// All routes are prefixed with /.netlify/functions/api
app.use('/.netlify/functions/api/prices', require('../../routes/prices'));
app.use('/.netlify/functions/api/submit', require('../../routes/orders'));
app.use('/.netlify/functions/api/admin', require('../../routes/admin'));

// Health check
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root check
app.get('/.netlify/functions/api', (req, res) => {
  res.json({ message: 'Backend working 🚀', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ─── MongoDB Connection (cached for serverless) ───────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB');

    // Seed default prices if empty
    const count = await Price.countDocuments();
    if (count === 0) {
      await Price.insertMany([
        { label: 'Pizza', price: 120 },
        { label: 'Burger', price: 80 },
        { label: 'Pasta', price: 150 },
        { label: 'Sandwich', price: 60 },
        { label: 'Salad', price: 90 }
      ]);
      console.log('✅ Default prices seeded successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// ─── Serverless Handler ───────────────────────────────────
const handler = serverless(app, {
  binary: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'
  ]
});

module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return handler(event, context);
};
