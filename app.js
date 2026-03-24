const express = require("express");
const app = express();

// Simple middleware
app.use(express.json());

// Test endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running", 
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;
