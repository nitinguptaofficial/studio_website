const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check against env variables
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate token
  const payload = {
    admin: {
      username: adminUsername
    }
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token, username });
    }
  );
});

module.exports = router;
