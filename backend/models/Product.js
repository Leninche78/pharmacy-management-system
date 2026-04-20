const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
  },
  category: {
    type: DataTypes.STRING,
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reorderThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  gstRate: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 0, 5, 12, 18, 28
  },
}, {
  timestamps: true,
});

module.exports = Product;
