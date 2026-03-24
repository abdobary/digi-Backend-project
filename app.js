const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Connect to MongoDB without crashing on error
const mongoUrl = process.env.mongodb_url;
if (mongoUrl) {
  mongoose.connect(mongoUrl)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err.message));
} else {
  console.error("❌ MONGODB_URL not set");
}

app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = app;
