const { User } = require('./models');
const bcrypt = require('bcrypt');

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log('Total users:', users.length);
    for (const u of users) {
      console.log(`- ${u.email} (Role: ${u.role})`);
      // Also check if 140505 matches
      const match = await bcrypt.compare('140505', u.password);
      const match2 = await bcrypt.compare('password', u.password);
      console.log(`  Password is '140505': ${match}`);
      console.log(`  Password is 'password': ${match2}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkUsers();
