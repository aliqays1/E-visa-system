const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/somalia_evisa');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@evisa.gov.so' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // Create a secure hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      fullName: 'Chief Immigration Officer',
      email: 'admin@evisa.gov.so',
      password: hashedPassword,
      role: 'officer' // This is the crucial part that unlocks the dashboard!
    });

    await adminUser.save();
    console.log('Success! Admin user seeded into database.');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
