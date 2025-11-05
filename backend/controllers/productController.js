const Product = require('../models/product');
const Category = require('../models/category');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { uploadToCloudinary, uploadBufferToCloudinary, deleteFromCloudinary } = require('../services/cloudinary-service');


const createProduct = async (req, res) => {
    try {
        console.log('hello =>', req.file);

        const { name, price, categoryId } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'argov/products');
        }

        const product = await Product.create({
            name,
            price,
            categoryId,
            image: imageUrl,
        });

        res.status(201).json(product);
    } catch (err) {
        console.error('Create product failed:', err);
        res.status(400).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ error: 'Product not found' });

        const { name, description, price, categoryId } = req.body;

        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (categoryId) product.categoryId = categoryId;

        if (req.file) {
            try {
                if (product.image) {
                    await deleteFromCloudinary(product.image);
                }

                const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'argov/products');

                product.image = uploadResult.secure_url;

                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.warn('Cloudinary image update failed:', err.message);
            }
        }

        await product.save();

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (err) {
        console.error('Update product failed:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getProducts = async (req, res) => {
    try {

        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '20'));
        const offset = (page - 1) * limit;
        const sort = req.query.sort === 'price_desc' ? [['price', 'DESC']] : [['price', 'ASC']];
        const search = req.query.search || '';
        const category = req.query.category || '';


        const where = {};
        if (search) where.name = { [Op.like]: `%${search}%` };


        const include = [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'uuid', 'name'],
                where: category ? { name: category } : undefined
            }
        ];

        const { count, rows } = await Product.findAndCountAll({
            where,
            include,
            limit,
            offset,
            order: sort
        });


        res.json({ total: count, page, perPage: limit, data: rows });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'uuid', 'name'],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);

    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.image) {
            try {
                await deleteFromCloudinary(product.image)
            } catch (err) {
                console.warn('Failed to delete image from Cloudinary:', err.message);
            }
        }

        await product.destroy();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product failed:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const bulkUpload = async (req, res) => {
    try {
        console.log('File received:', req.file?.originalname);

        if (!req.file) return res.status(400).json({ error: 'CSV/XLSX file required' });

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        const CHUNK_SIZE = 100;
        let rows = [];

        if (ext === 'xlsx' || ext === 'xls') {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(req.file.buffer);
            const worksheet = workbook.worksheets[0];

            const headerRow = worksheet.getRow(1);
            const headers = headerRow.values.slice(1).map((v) => (v || '').toString().trim().toLowerCase());

            const colIndex = {};
            headers.forEach((h, i) => (colIndex[h] = i + 1));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const name = (row.getCell(colIndex['name'])?.value || '').toString().trim();
                const price = (row.getCell(colIndex['price'])?.value || '').toString().trim();
                const category = (row.getCell(colIndex['category'])?.value || '').toString().trim();

                let imageVal = null;
                if (colIndex['image']) {
                    const cellVal = row.getCell(colIndex['image']).value;
                    if (typeof cellVal === 'string') {
                        imageVal = cellVal.trim();
                    } else if (cellVal && typeof cellVal === 'object') {
                        imageVal = cellVal.hyperlink || cellVal.text || null;
                    }
                }

                if (!name && !price && !category) return;
                rows.push({ name, price, category, image: imageVal });
            });
        }

        else if (ext === 'csv') {
            rows = await new Promise((resolve, reject) => {
                const parsed = [];
                const stream = Readable.from(req.file.buffer.toString());
                stream
                    .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
                    .on('error', reject)
                    .on('data', (row) => parsed.push(row))
                    .on('end', () => resolve(parsed));
            });
        }

        else {
            return res.status(400).json({ error: 'Unsupported file type. Upload CSV or XLSX.' });
        }

        if (!rows.length) return res.status(400).json({ error: 'No rows found in file.' });

        const categoryCache = new Map();
        let buffer = [];
        let inserted = 0;

        const flush = async () => {
            if (!buffer.length) return;
            const t = await sequelize.transaction();
            try {
                await Product.bulkCreate(buffer, { validate: true, transaction: t });
                await t.commit();
                inserted += buffer.length;
                buffer = [];
            } catch (err) {
                await t.rollback();
                console.error('Chunk insert failed:', err.message);
                throw err;
            }
        };

        for (const row of rows) {
            console.log('row =>', row);

            const name = (row.name || '').trim();
            const price = parseFloat((row.price || '0').toString().replace(/[^0-9.-]+/g, '')) || 0;
            const categoryName = (row.category || 'Uncategorized').trim();
            const imageUrl = (row.image || '').trim();

            if (!name || !price) continue;

            let categoryId = categoryCache.get(categoryName);
            if (!categoryId) {
                const [cat] = await Category.findOrCreate({ where: { name: categoryName } });
                categoryId = cat.id;
                categoryCache.set(categoryName, categoryId);
            }

            let finalImage = null;
            if (imageUrl && imageUrl.startsWith('http')) {
                try {
                    finalImage = await uploadToCloudinary(imageUrl); // works with URL directly
                } catch (err) {
                    console.warn(`Image upload failed for ${imageUrl}: ${err.message}`);
                }
            }

            buffer.push({ name, price, categoryId, image: finalImage });
            if (buffer.length >= CHUNK_SIZE) await flush();
        }

        if (buffer.length) await flush();

        res.json({
            success: true,
            message: 'Bulk upload completed successfully',
            inserted,
            rowsParsed: rows.length,
        });
    } catch (err) {
        console.error('Bulk upload failed:', err);
        res.status(500).json({ error: `Unexpected Error: ${err.message}` });
    }
};

module.exports = { createProduct, updateProduct, getProducts, getProductById, bulkUpload, deleteProduct }
