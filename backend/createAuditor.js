const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAuditor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/evisa');
    
    // Check if auditor already exists
    const existingAuditor = await User.findOne({ email: 'auditor@evisa.gov.so' });
    if (existingAuditor) {
      console.log('Auditor user already exists!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const auditorUser = new User({
      fullName: 'Chief Auditor',
      email: 'auditor@evisa.gov.so',
      password: hashedPassword,
      role: 'auditor',
      phone: '+252 61 1234567',
      nationality: 'Somalia'
    });

    await auditorUser.save();
    console.log('Success! Auditor account created successfully.');
    process.exit();
  } catch (error) {
    console.error('Error creating auditor:', error);
    process.exit(1);
  }
};

createAuditor();
