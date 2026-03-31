const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Received', 'Cancelled'),
    defaultValue: 'Pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  expectedDeliveryDate: {
    type: DataTypes.DATE,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = PurchaseOrder;
