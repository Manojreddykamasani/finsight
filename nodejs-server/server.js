const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const cors = require("cors");

// --- Route Imports ---
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const agentRoutes = require('./routes/agentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// --- Socket Import ---
const stockSocket = require("./sockets/stockSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
stockSocket(io);

// --- Environment Variables ---
const MONGO_URI = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

// --- Database Connection & Server Startup ---
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    
    // Start the HTTP server only after the database connection is established
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Fatal MongoDB connection error:", err);
    // Exit the process with a failure code if we can't connect to the DB
    process.exit(1);
  });

