const express = require('express');
const router = express.Router();

const userRoutes = require('./user');
const categoryRoutes = require('./category');
const productRoutes = require('./product');

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);


module.exports = router;