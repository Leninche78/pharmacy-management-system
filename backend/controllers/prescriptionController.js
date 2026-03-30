const { Prescription, Customer } = require('../models');
const { sendPrescriptionEmail } = require('../utils/emailService');

// Create prescription
const createPrescription = async (req, res) => {
  try {
    const { customerId, doctorName, issueDate, validUntil, notes } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const prescription = await Prescription.create({
      customerId,
      doctorName,
      issueDate,
      validUntil,
      notes
    });

    // Dispatch email notification asynchronously (don't block the response)
    if (customer.email) {
      sendPrescriptionEmail(customer.email, customer.name, doctorName);
    }

    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ message: 'Error creating prescription', error: error.message });
  }
};

// Get prescriptions for a customer
const getPrescriptionsByCustomerId = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { customerId: req.params.customerId }
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [Customer],
      order: [['createdAt', 'DESC']]
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all prescriptions', error: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionsByCustomerId,
  getAllPrescriptions,
};
