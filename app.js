require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errorhandler } = require("./middleware/ErrorHandlerMiddleware");
const { userCont } = require("./Controllers/UserController");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection - FIXED: Use uppercase MONGODB_URL
async function dbConnection() {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.mongodb_url;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL not set");
        }
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err.message);
    }
}
dbConnection();

// Routes with error handling - prevents crashing if files missing
try {
    const authRoutes = require("./Routes/authRoutes");
    app.use("/api", authRoutes);
} catch (err) {
    console.error("❌ Failed to load authRoutes:", err.message);
}

try {
    const categoryRoutes = require("./Routes/CategoryRoutes");
    app.use('/api/categories', categoryRoutes);
} catch (err) {
    console.error("❌ Failed to load categoryRoutes:", err.message);
}

try {
    const productRoutes = require("./Routes/ProductsRoutes");
    app.use('/api/products', productRoutes);
} catch (err) {
    console.error("❌ Failed to load productRoutes:", err.message);
}

// User controller - only if it exists
try {
    if (typeof userCont === 'function') {
        userCont(app);
    }
} catch (err) {
    console.error("❌ Failed to load userCont:", err.message);
}

// Error handler
try {
    if (typeof errorhandler === 'function') {
        app.use(errorhandler);
    }
} catch (err) {
    console.error("❌ Failed to load errorhandler:", err.message);
}

// Export for Vercel (REQUIRED)
module.exports = app;

// For local development ONLY
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
}
