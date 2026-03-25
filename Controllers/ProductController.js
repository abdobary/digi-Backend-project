const Product = require("../models/Products");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Product name is required" });
        }
        if (!price) {
            return res.status(400).json({ message: "Product price is required" });
        }
        
        // Ensure user exists in request
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        
        const product = new Product({
            name,
            description: description || "",
            price,
            image: image || "",
            createdBy: req.user._id
        });
        
        await product.save();
        
        // Populate references for response
        await product.populate('createdBy', 'username email');
        
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { minPrice, maxPrice, search } = req.query;
        
        let filter = {};
        
        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Search by name or description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const products = await Product.find(filter)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid product ID" 
            });
        }
        
        const product = await Product.findById(id)
            .populate('createdBy', 'username email');
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid product ID" 
            });
        }
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }
        
        // Check if user is admin or product creator
        const isAdmin = req.user.role === 'admin';
        const isCreator = product.createdBy.equals(req.user._id);
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ 
                success: false,
                message: "Not authorized to update this product",
                details: {
                    userRole: req.user.role,
                    userId: req.user._id,
                    productCreatorId: product.createdBy
                }
            });
        }
        
        // Update fields
        if (name) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (image !== undefined) product.image = image;
        
        await product.save();
        await product.populate('createdBy', 'username email');
        
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid product ID" 
            });
        }
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }
        
        // Check if user is admin or product creator
        const isAdmin = req.user.role === 'admin';
        const isCreator = product.createdBy.equals(req.user._id);
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ 
                success: false,
                message: "Not authorized to delete this product",
                details: {
                    userRole: req.user.role,
                    userId: req.user._id,
                    productCreatorId: product.createdBy
                }
            });
        }
        
        await product.deleteOne();
        
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const getProductsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid user ID" 
            });
        }
        
        const products = await Product.find({ createdBy: userId })
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error in getProductsByUser:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user._id })
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error in getMyProducts:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByUser,
    getMyProducts
};
