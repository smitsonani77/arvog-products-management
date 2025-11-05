require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require("./config/db.js");
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// app.use('/uploads', express.static('uploads')); // serve uploaded files

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();

        // 👇 This will create tables if they don’t exist
        await sequelize.sync();
        console.log('DB connected');
    } catch (err) {
        console.error('DB connection error', err);
    }
    console.log(`Server running on ${PORT}`);
});

server.timeout = 0;
server.keepAliveTimeout = 0;
