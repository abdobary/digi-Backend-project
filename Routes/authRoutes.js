const express = require("express");
const router = express.Router();

// Direct implementation - no external controller needed
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Register request:", req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please provide all fields" });
    }
    
    // Simple success response for testing
    res.status(201).json({ 
      msg: "User registered successfully!",
      token: "test-token-123",
      user: { username, email }
    });
    
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("🔑 Login request:", req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }
    
    res.json({ 
      msg: "Login successful!",
      token: "test-token-123",
      user: { email, username: "testuser" }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: error.message });
  }
});

router.get("/email/:email", (req, res) => {
  res.json({ 
    username: "testuser",
    email: req.params.email,
    address: "123 Test Street"
  });
});

module.exports = router;
