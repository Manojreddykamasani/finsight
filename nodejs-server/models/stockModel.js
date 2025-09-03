const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  sector: { type: String, required: true },
  description: { type: String },

  logoUrl: { type: String },

  price: { type: Number, required: true },
  marketCap: { type: Number },
  peRatio: { type: Number },
  dividendYield: { type: Number },
  volatility: { type: Number, default: 0.02 },

  volume: { type: Number, default: 0 },
  avgVolume: { type: Number, default: 0 },
  history: [
    {
      price: Number,
      volume: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stock", stockSchema);
