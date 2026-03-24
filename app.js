require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// CORS - Allow your local frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
    }
}
dbConnection();

// Routes with error handling
let authRoutes, productRoutes, categoryRoutes;

try {
  authRoutes = require("./routes/authRoutes");
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Failed to load authRoutes:", err.message);
  authRoutes = express.Router();
  authRoutes.get("/auth-status", (req, res) => {
    res.json({ error: "Auth routes failed to load", details: err.message });
  });
}

try {
  productRoutes = require("./routes/ProductsRoutes");
  console.log("✅ Product routes loaded");
} catch (err) {
  console.error("❌ Failed to load productRoutes:", err.message);
  productRoutes = express.Router();
}

try {
  categoryRoutes = require("./routes/CategoryRoutes");
  console.log("✅ Category routes loaded");
} catch (err) {
  console.error("❌ Failed to load categoryRoutes:", err.message);
  categoryRoutes = express.Router();
}

// Mount routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get("/debug", (req, res) => {
  res.json({
    status: "App running",
    mongodb_url_set: !!(process.env.MONGODB_URL || process.env.mongodb_url),
    jwt_secret_set: !!process.env.JWT_SECRET,
    routes_loaded: {
      auth: !!authRoutes,
      products: !!productRoutes,
      categories: !!categoryRoutes
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: err.message 
  });
});

// Export for Vercel
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Frontend should be at: http://localhost:5173`);
  });
}
