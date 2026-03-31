const { sequelize } = require('./config/database');

async function fixDb() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE Users ADD COLUMN isActive TINYINT(1) DEFAULT 1;');
    console.log('✅ Added isActive column to Users');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

fixDb();
