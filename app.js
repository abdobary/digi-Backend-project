/*
express – Web framework for building API routes and handling HTTP requests – npm install express
mongoose – Object Document Mapper(ODM) library for MongoDB providing schema validation and database operations – npm install mongoose
cors – Enables Cross-Origin Resource Sharing so React app can communicate with Node server – npm install cors
dotenv – Loads environment variables from a .env file into process.env to keep sensitive data secure – npm install dotenv
nodemon – Automatically restarts the server when file changes are detected to speed up development – npm install --save-dev nodemon
bcryptjs – For hashing passwords when implementing user authentication – npm install bcryptjs
jsonwebtoken – For creating and verifying JWT tokens for authentication – npm install jsonwebtoken
express-validator – Provides middleware for validating and sanitizing incoming request data – npm install express-validato
morgan – HTTP request logger middleware useful for debugging – npm install morgan

npm install express mongoose cors dotenv bcryptjs jsonwebtoken express-validator morgan
*/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errorhandler } = require("./middleware/ErrorHandlerMiddleware");
const {userCont} = require("./Controllers/UserController")
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

async function dbConnection() {
    try {
        // Remove useNewUrlParser and useUnifiedTopology - they're no longer needed
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err.message);
    }
}

dbConnection();

const authRoutes = require("./Routes/authRoutes");
app.use("/api", authRoutes);

const categoryRoutes = require("./Routes/CategoryRoutes");
app.use('/api/categories', categoryRoutes);

const productRoutes = require("./Routes/ProductsRoutes");
app.use('/api/products', productRoutes);

userCont(app);

app.use(errorhandler); 

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

module.exports = app
