const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing users
    await User.deleteMany();
    console.log('Cleared existing users.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Applicant
    await User.create({
      fullName: 'Ayaan Warsame',
      email: 'applicant@evisa.gov.so',
      password: hashedPassword,
      role: 'applicant',
      phone: '+252 61 555 1234',
      nationality: 'Somali',
      passportNumber: 'N00998877'
    });
    console.log('Applicant user created: applicant@evisa.gov.so / password123');

    // Create Officer
    await User.create({
      fullName: 'Officer Ahmed',
      email: 'officer@evisa.gov.so',
      password: hashedPassword,
      role: 'officer'
    });
    console.log('Officer user created: officer@evisa.gov.so / password123');

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
