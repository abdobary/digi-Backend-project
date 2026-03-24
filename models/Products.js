// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: false,
        trim: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    image: { 
        type: String, 
        required: false,
        default: "" 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;