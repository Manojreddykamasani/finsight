const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach it to the request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ status: "fail", message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ status: "fail", message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ status: "fail", message: "Not authorized, no token" });
  }
};

module.exports = { protect };