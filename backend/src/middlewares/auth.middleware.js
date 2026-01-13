const jwt = require('jsonwebtoken');
const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.role === 'student') {
      user = await Student.findById(decoded.userId).select('-password');
    } else if (decoded.role === 'employer') {
      user = await Employer.findById(decoded.userId).select('-password');
    } else if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.user.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
