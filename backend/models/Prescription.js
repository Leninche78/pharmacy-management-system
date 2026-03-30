const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

const encryptData = (data) => {
  if (!data) return data;
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

const decryptData = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || ciphertext; 
  } catch (e) {
    return ciphertext;
  }
};

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATEONLY,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  hooks: {
    beforeSave: (instance) => {
      if (instance.changed('notes')) instance.notes = encryptData(instance.notes);
    },
    afterFind: (results) => {
      if (!results) return;
      const decryptInstance = (instance) => {
        if (instance.notes) instance.notes = decryptData(instance.notes);
      };

      if (Array.isArray(results)) {
        results.forEach(decryptInstance);
      } else {
        decryptInstance(results);
      }
    }
  }
});

module.exports = Prescription;
