const { User, sequelize } = require('./models');
const bcrypt = require('bcrypt');

async function fixPassword() {
  try {
    const email = 'sarathilenin@gmail.com';
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      console.log('User found! Changing password to 140505');
      const hashedPassword = await bcrypt.hash('140505', 10);
      user.password = hashedPassword;
      await user.save();
      console.log('✅ Password successfully updated to 140505!');
    } else {
      console.log('User not found. Creating test user.');
      const hashedPassword = await bcrypt.hash('140505', 10);
      user = await User.create({
        name: 'Sarathi Lenin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ User created with password 140505!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

fixPassword();
