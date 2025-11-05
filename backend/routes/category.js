const express = require('express');
const Category = require('../models/category');
const router = express.Router();


// Create
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ where: { name } });

        if (existingCategory) {
            console.log('Category already exists:', existingCategory.dataValues);
            return res.status(400).json({ error: 'Category already exists.' });
        }

        // Create new category
        const newCategory = await Category.create({ name });
        res.status(201).json(newCategory);

    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Read (list)
router.get('/', async (req, res) => {
    const cats = await Category.findAll();
    res.json(cats);
});


// Update
router.put('/:id', async (req, res) => {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    cat.name = req.body.name || cat.name;
    await cat.save();
    res.json(cat);
});


// Delete
router.delete('/:id', async (req, res) => {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    await cat.destroy();
    res.json({ success: true });
});


module.exports = router;