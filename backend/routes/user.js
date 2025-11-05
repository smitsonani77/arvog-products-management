const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({ email, password: hash });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.json({ id: user.id, email: user.email });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


module.exports = router;