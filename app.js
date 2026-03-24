require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
async function dbConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
