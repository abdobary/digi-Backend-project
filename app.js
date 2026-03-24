require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// CORS - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
async function dbConnection() {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.mongodb_url;
        if (!mongoUrl) {
            console.error("MONGODB_URL environment variable is not set");
            return;
        }
        
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
    }
}
dbConnection();

// Routes - Comment these out if they cause issues
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/ProductsRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");

// Mount routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Root route for health check
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running", 
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    endpoints: {
      root: "/",
      test: "/api/test",
      register: "/api/register",
      login: "/api/login"
    }
  });
});

// Debug endpoint to check environment
app.get("/debug", (req, res) => {
  res.json({
    status: "App is running",
    env: process.env.NODE_ENV,
    mongodb_url_set: !!process.env.MONGODB_URL,
    jwt_secret_set: !!process.env.JWT_SECRET,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ 
    message: "Internal server error", 
    error: err.message,
    path: req.path
  });
});

// Export for Vercel (THIS IS CRITICAL)
module.exports = app;
