const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const Category = sequelize.define("Category", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
});

module.exports = Category;
