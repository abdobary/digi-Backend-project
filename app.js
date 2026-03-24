require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// CORS - Allow all origins for development (fixes localhost issues)
app.use(cors({
  origin: true, // This allows ANY origin to access your API
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
            throw new Error("MONGODB_URL environment variable is not set");
        }
        
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err.message);
    }
}
dbConnection();

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/ProductsRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Root route for health check
app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok" });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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
    console.log(`Server is running at port ${port}`);
  });
}
