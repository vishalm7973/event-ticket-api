const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const ROLES = require('../src/constants/roles');
const loadAndValidateEnv = require('../src/config/env');

try {
  loadAndValidateEnv();
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
}

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

const seed = async () => {
  await connectDB();

  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    admin.firstName = 'Admin';
    admin.lastName = 'User';
    admin.role = ROLES.ADMIN;
    admin.password = ADMIN_PASSWORD;
    await admin.save();
    console.log(`Updated ADMIN: ${ADMIN_EMAIL}`);
  } else {
    admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_EMAIL,
      role: ROLES.ADMIN,
    });
    admin.password = ADMIN_PASSWORD;
    await admin.save();
    console.log(`Created ADMIN: ${ADMIN_EMAIL}`);
  }

  console.log('\nSeed complete. Admin login:');
  console.log(`  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
};

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
