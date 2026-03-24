require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection - FIXED: Use uppercase MONGODB_URL
async function dbConnection() {
    try {
        // Check if the connection string exists
        const mongoUrl = process.env.MONGODB_URL || process.env.mongodb_url;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL environment variable is not set");
        }
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err.message);
        // Don't exit in production, just log the error
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
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

// Test endpoint to check if API is working
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
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// For Vercel serverless deployment
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}
