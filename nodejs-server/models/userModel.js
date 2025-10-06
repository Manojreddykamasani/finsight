const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // It's better to require crypto at the top

// --- SUB-DOCUMENT SCHEMA FOR STOCKS IN A USER'S PORTFOLIO ---
const portfolioStockSchema = new mongoose.Schema({
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // Reference to the Stock model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'] // Can't own 0 or negative shares
    },
    averageBuyPrice: {
        type: Number,
        required: true
    }
}, { 
    _id: false // This prevents Mongoose from creating an _id for each sub-document
});


// --- MAIN USER SCHEMA ---
const userSchema = new mongoose.Schema({
  // --- Existing Authentication and Verification Fields ---
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Hide password from default query results
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // --- NEW Fields for Trading Simulation ---
  balance: {
      type: Number,
      default: 100000 // Start users with $100,000 in virtual currency
  },
  portfolio: [portfolioStockSchema], // Embed the portfolio schema here

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// --- Existing Mongoose Middleware and Methods ---

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare candidate password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to generate a 6-digit OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  return otp;
};

// Method to generate a password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha265').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;