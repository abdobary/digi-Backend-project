require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Database connection - with fallback
async function dbConnection() {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.mongodb_url;
        if (!mongoUrl) {
            throw new Error("MongoDB URL not set");
        }
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err.message);
    }
}
dbConnection();

// Routes with error handling
try {
    const authRoutes = require("./Routes/authRoutes");
    app.use("/api", authRoutes);
    console.log("✅ Auth routes loaded");
} catch (err) {
    console.error("❌ Auth routes failed:", err.message);
}

try {
    const categoryRoutes = require("./Routes/CategoryRoutes");
    app.use('/api/categories', categoryRoutes);
    console.log("✅ Category routes loaded");
} catch (err) {
    console.error("❌ Category routes failed:", err.message);
}

try {
    const productRoutes = require("./Routes/ProductsRoutes");
    app.use('/api/products', productRoutes);
    console.log("✅ Product routes loaded");
} catch (err) {
    console.error("❌ Product routes failed:", err.message);
}

// User controller with error handling
try {
    const { userCont } = require("./Controllers/UserController");
    if (typeof userCont === 'function') {
        userCont(app);
    }
    console.log("✅ User controller loaded");
} catch (err) {
    console.error("❌ User controller failed:", err.message);
}

// Error handler with error handling
try {
    const { errorhandler } = require("./middleware/ErrorHandlerMiddleware");
    if (typeof errorhandler === 'function') {
        app.use(errorhandler);
    }
    console.log("✅ Error handler loaded");
} catch (err) {
    console.error("❌ Error handler failed:", err.message);
}

// Basic health check
app.get("/", (req, res) => {
    res.json({ message: "API is running", status: "ok" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", path: req.path });
});

// Export for Vercel - REQUIRED
module.exports = app;

// Only listen locally
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server running at port ${port}`);
    });
}
