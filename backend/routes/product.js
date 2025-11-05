const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createProduct,
    updateProduct,
    getProducts,
    bulkUpload,
    getProductById,
    deleteProduct
} = require('../controllers/productController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), createProduct);

router.put('/id/:id', upload.single('image'), updateProduct);

router.get('/id/:id', getProductById);

router.delete('/id/:id', deleteProduct);

router.get('/', getProducts);

router.post('/bulk-upload', upload.single('file'), bulkUpload);

module.exports = router;
