const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const Category = require("./category.js");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT, allowNull: false },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
});

Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

module.exports = Product;
