require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Cache MongoDB connection for serverless environment
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnection() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoUrl = process.env.mongodb_url;
        
        if (!mongoUrl) {
            console.error("❌ mongodb_url is not defined in environment variables");
            throw new Error("MongoDB URL is not defined");
        }

        console.log("🔄 Connecting to MongoDB...");
        cached.promise = mongoose.connect(mongoUrl, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }).then((mongoose) => {
            console.log("✅ Connected to MongoDB!");
            return mongoose;
        }).catch((err) => {
            console.error("❌ MongoDB connection error:", err.message);
            cached.promise = null;
            throw err;
        });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
}

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await dbConnection();
        next();
    } catch (err) {
        console.error("Database connection failed:", err.message);
        res.status(500).json({ 
            message: "Database connection error", 
            error: err.message 
        });
    }
});

// Routes
const authRoutes = require("./Routes/authRoutes");
app.use("/api", authRoutes);

const categoryRoutes = require("./Routes/CategoryRoutes");
app.use('/api/categories', categoryRoutes);

const productRoutes = require("./Routes/ProductsRoutes");
app.use('/api/products', productRoutes);

// User controller
const { userCont } = require("./Controllers/UserController");
if (typeof userCont === 'function') {
    userCont(app);
}

// Error handler
const { errorhandler } = require("./middleware/ErrorHandlerMiddleware");
if (typeof errorhandler === 'function') {
    app.use(errorhandler);
}

// Basic health check
app.get("/", (req, res) => {
    res.json({ message: "API is running", status: "ok" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", path: req.path });
});

// Export for Vercel
module.exports = app;

// Only listen locally
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server running at port ${port}`);
    });
}
