const Product = require("../models/Products");

const createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Product name is required" });
        }
        if (!price) {
            return res.status(400).json({ message: "Product price is required" });
        }
        
        const product = new Product({
            name,
            price,
            createdBy: req.user._id
        });
        
        await product.save();
        
        // Populate references for response
        await product.populate('createdBy', 'username email');
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'username email');
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Check if user is admin or product creator
        if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this product" });
        }
        
        product.name = name || product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price !== undefined ? price : product.price;
        product.image = image !== undefined ? image : product.image;
        
        await product.save();
        
        await product.populate('createdBy', 'username email');
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Check if user is admin or product creator
        if (req.user.role !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this product" });
        }
        
        await product.deleteOne();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductsByUser = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.params.userId })
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByUser
};