const { Product, Sale, SaleItem, Customer } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    // Basic aggregation
    const totalProducts = await Product.count();
    const lowStockProducts = await Product.count({
      where: {
        stock: { [Op.lt]: 10 }
      }
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringProducts = await Product.count({
      where: {
        stock: { [Op.gt]: 0 },
        expiryDate: {
          [Op.ne]: null,
          [Op.lte]: thirtyDaysFromNow
        }
      }
    });

    const totalCustomers = await Customer.count();
    
    // Total Revenue (all time)
    const totalRevenueResult = await Sale.sum('totalAmount');
    const totalRevenue = totalRevenueResult || 0;
    
    // Total Orders
    const totalOrders = await Sale.count();

    // Recent Sales
    const recentSales = await Sale.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Customer, attributes: ['id', 'name'] }
      ]
    });

    // Real Sales Data for Chart (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentChartSales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: ['totalAmount', 'createdAt']
    });

    const formatDate = (date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    };

    const salesByDate = {};
    recentChartSales.forEach(sale => {
      const dateStr = formatDate(sale.createdAt);
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + Number(sale.totalAmount);
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesData = [];
    for(let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = formatDate(d);
      salesData.push({
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        sales: salesByDate[dateKey] || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockProducts,
        expiringProducts,
        totalCustomers,
        recentSales,
        salesData
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};
