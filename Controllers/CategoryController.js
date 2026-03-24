const Category = require("../models/Category");

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({
            name,
            description
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        // Check if new name already exists (and it's not the current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: "Category name already exists" });
            }
        }
        
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        
        await category.save();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        // Check if category has products
        const Product = require("../models/Product");
        const productsCount = await Product.countDocuments({ categoryId: req.params.id });
        
        if (productsCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category. It has ${productsCount} products associated.` 
            });
        }
        
        await category.deleteOne();
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};