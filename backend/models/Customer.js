const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper to encrypt
const encryptData = (data) => {
  if (!data) return data;
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// Helper to decrypt
const decryptData = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || ciphertext; 
  } catch (e) {
    return ciphertext; // Fallback if it wasn't encrypted yet
  }
};

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.TEXT,
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: (instance) => {
      // Encrypt sensitive fields before saving to DB
      if (instance.changed('phone')) instance.phone = encryptData(instance.phone);
      if (instance.changed('email')) instance.email = encryptData(instance.email);
      if (instance.changed('address')) instance.address = encryptData(instance.address);
    },
    afterFind: (results) => {
      // Decrypt sensitive fields when reading from DB
      if (!results) return;
      const decryptInstance = (instance) => {
        if (instance.phone) instance.phone = decryptData(instance.phone);
        if (instance.email) instance.email = decryptData(instance.email);
        if (instance.address) instance.address = decryptData(instance.address);
      };

      if (Array.isArray(results)) {
        results.forEach(decryptInstance);
      } else {
        decryptInstance(results);
      }
    }
  }
});

module.exports = Customer;
