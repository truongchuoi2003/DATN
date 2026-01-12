const User = require('../models/User.model.js');
const jwt = require('jsonwebtoken');

// helper tạo token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'NO_SECRET_PROVIDED', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    console.log('--- REGISTER ROUTE HIT ---');
    console.log('req.body =', req.body);

    // debug env
    console.log('JWT_SECRET present?', !!process.env.JWT_SECRET);
    // optional: show the actual secret only in dev if you want
    // console.log('JWT_SECRET =', process.env.JWT_SECRET);

    const { fullName, email, password, role } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: fullName/email/password' });
    }

    // check existing first (gives clearer error than catching duplicate key)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // create user
    const user = await User.create({
      fullName,
      email,
      password,
      role
    });

    // success
    return res.status(201).json({
      message: 'Register success',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // log full error for debugging
    console.error('!!! REGISTER ERROR FULL:');
    console.error(error);
    // if mongoose duplicate key slipped through:
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value', detail: error.keyValue });
    }
    // send useful info back in dev
    return res.status(500).json({
      message: error.message || 'Server error',
      name: error.name,
      stack: process.env.NODE_ENV === 'production' ? undefined : (error.stack || '')
    });
  }
};
