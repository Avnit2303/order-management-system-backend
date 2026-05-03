const jwt = require('jsonwebtoken');

// Hardcoded admin credentials
const ADMIN_USERNAME = 'av';
const ADMIN_PASSWORD = '123';

// POST /api/admin/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
