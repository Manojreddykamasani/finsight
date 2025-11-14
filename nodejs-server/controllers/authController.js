const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.otp = undefined;
  user.otpExpiry = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ status: 'fail', message: 'User with this email already exists and is verified.' });
    }

    if (!user) {
      user = new User({ email, password });
    } else {
      user.password = password; 
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: true });

    const message = `Your Finsight OTP for registration is: ${otp}\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Finsight: Your Account Verification OTP',
        message: message,
      });

      res.status(200).json({
        status: 'success',
        message: 'OTP sent to email!',
      });
    } catch (err) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ status: 'error', message: 'There was an error sending the email. Please try again later.' });
    }
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.verifyOtpAndLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'OTP is invalid or has expired.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isVerified || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email, password or unverified user.' });
    }

    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'There is no user with that email address.' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `https://finsight-jade.vercel.app/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you did not forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ status: 'error', message: 'There was an error sending the email. Please try again later.' });
    }
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.comparePassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect current password.' });
    }

    user.password = req.body.newPassword;
    await user.save();

    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};