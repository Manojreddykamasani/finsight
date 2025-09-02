const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const router = express.Router();

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer exists.' });
    }

    req.user = freshUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
  }
};

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtpAndLogin);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;