const { PurchaseOrder, PurchaseOrderItem, Product, Supplier, Batch, sequelize } = require('../models');

// Get all POs
const getAllPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.findAll({
      include: [
        { model: Supplier },
        { model: PurchaseOrderItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
  }
};

// Get single PO
const getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier },
        { model: PurchaseOrderItem, include: [Product] }
      ]
    });
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase order', error: error.message });
  }
};

// Create PO
const createPurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { supplierId, expectedDeliveryDate, items, remarks } = req.body;
    
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += parseFloat(item.quantity) * parseFloat(item.unitPrice);
    }

    const po = await PurchaseOrder.create({
      supplierId,
      expectedDeliveryDate,
      totalAmount,
      remarks,
      status: 'Pending'
    }, { transaction: t });

    const poItems = items.map(item => ({
      purchaseOrderId: po.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice)
    }));

    await PurchaseOrderItem.bulkCreate(poItems, { transaction: t });

    await t.commit();
    res.status(201).json(po);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Error creating purchase order', error: error.message });
  }
};

// Update PO status (e.g., Receive)
const updatePurchaseOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [PurchaseOrderItem]
    });

    if (!po) {
      await t.rollback();
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    const { status, batchData } = req.body; // batchData is array of { productId, batchNumber, expiryDate }

    // If receiving goods
    if (status === 'Received' && po.status !== 'Received') {
      for (const item of po.PurchaseOrderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        
        // Update product stock
        await product.update({ stock: product.stock + item.quantity }, { transaction: t });
        
        // Create batch if batchData provided
        const bData = batchData ? batchData.find(b => b.productId === item.productId) : null;
        if (bData) {
          await Batch.create({
            batchNumber: bData.batchNumber,
            productId: item.productId,
            supplierId: po.supplierId,
            purchaseOrderId: po.id,
            quantity: item.quantity,
            expiryDate: bData.expiryDate,
            costPrice: item.unitPrice
          }, { transaction: t });
        }
      }
    }

    await po.update({ status }, { transaction: t });
    await t.commit();
    res.json(po);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: 'Error updating purchase order status', error: error.message });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus
};
