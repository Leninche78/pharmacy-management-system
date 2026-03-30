const User = require('./User');
const Product = require('./Product');
const Customer = require('./Customer');
const Prescription = require('./Prescription');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Setting = require('./Setting');

// Define Relationships

// A Customer can have multiple Prescriptions
Customer.hasMany(Prescription, { foreignKey: 'customerId' });
Prescription.belongsTo(Customer, { foreignKey: 'customerId' });

// A User (Cashier/Pharmacist) handles multiple Sales
User.hasMany(Sale, { foreignKey: 'userId' });
Sale.belongsTo(User, { foreignKey: 'userId' });

// A Customer can make multiple Sales
Customer.hasMany(Sale, { foreignKey: 'customerId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });

// A Prescription can be associated with multiple Sales (if fulfilled over time)
Prescription.hasMany(Sale, { foreignKey: 'prescriptionId' });
Sale.belongsTo(Prescription, { foreignKey: 'prescriptionId' });

// Sale and SaleItem relationship
Sale.hasMany(SaleItem, { foreignKey: 'saleId' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

// Product and SaleItem relationship
Product.hasMany(SaleItem, { foreignKey: 'productId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  User,
  Product,
  Customer,
  Prescription,
  Sale,
  SaleItem,
  Setting,
};
