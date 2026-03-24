const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URL || process.env.mongodb_url;
if (mongoUrl) {
  mongoose.connect(mongoUrl)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err.message));
} else {
  console.error("❌ MONGODB_URL not set");
}

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Try to load auth routes with error handling
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api", authRoutes);
  console.log("✅ Auth routes loaded successfully");
} catch (err) {
  console.error("❌ Failed to load auth routes:", err.message);
  // Add a fallback endpoint to test if routes are loading
  app.get("/api/auth-status", (req, res) => {
    res.json({ 
      status: "Auth routes failed to load", 
      error: err.message 
    });
  });
}

module.exports = app;
