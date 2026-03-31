const { sequelize } = require('./config/database');

async function fixDb() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE Users ADD COLUMN resetPasswordToken VARCHAR(255);');
    await sequelize.query('ALTER TABLE Users ADD COLUMN resetPasswordExpires DATETIME;');
    console.log('✅ Added resetPassword columns to Users');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

fixDb();
