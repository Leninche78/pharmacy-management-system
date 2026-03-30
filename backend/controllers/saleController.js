const { Sale, SaleItem, Product, Customer } = require('../models');
const { sequelize } = require('../config/database');

// Process a new sale
const createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    let { items, customerId, paymentMethod, totalAmount, redeemPoints } = req.body;
    // items should be an array of { productId, quantity, unitPrice }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for the sale' });
    }

    let customerRef = null;
    let pointsToDeduct = 0;
    
    // Validate and apply point redemption
    if (customerId) {
      customerRef = await Customer.findByPk(customerId, { transaction });
      if (customerRef) {
        if (redeemPoints > 0) {
           if (customerRef.loyaltyPoints >= redeemPoints) {
             pointsToDeduct = redeemPoints;
             totalAmount = Math.max(0, totalAmount - redeemPoints); // 1 point = ₹1 discount
           } else {
             throw new Error('Not enough loyalty points');
           }
        }
      }
    }

    // Create the Sale record
    const sale = await Sale.create({
      userId: req.user.userId, // from authMiddleware
      customerId: customerId || null,
      totalAmount,
      paymentMethod
    }, { transaction });

    // Process each item
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      // Deduct stock
      await product.update({ stock: product.stock - item.quantity }, { transaction });

      // Create SaleItem record
      await SaleItem.create({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      }, { transaction });
    }

    // Update Customer points
    if (customerRef) {
       // Earn 1 point per 100 spent (after discounts)
       const earnedPoints = Math.floor(totalAmount / 100);
       const updatedPoints = customerRef.loyaltyPoints - pointsToDeduct + earnedPoints;
       await customerRef.update({ loyaltyPoints: updatedPoints }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Sale processed successfully', saleId: sale.id });

  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: 'Error processing sale', error: error.message });
  }
};

// Get all sales (for reporting)
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: SaleItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
};

// Export sales to CSV
const exportSalesCSV = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: SaleItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // CSV Header for QuickBooks/General accounting
    let csv = 'Transaction ID,Date,Time,Payment Method,Total Amount,Status\n';

    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      const time = new Date(sale.createdAt).toLocaleTimeString();
      csv += `${sale.id},${date},${time},${sale.paymentMethod || 'cash'},${sale.totalAmount},Completed\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('sales_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};

module.exports = {
  createSale,
  getAllSales,
  exportSalesCSV,
};
