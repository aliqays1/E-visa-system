const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  require('./models/User');
  const User = mongoose.model('User');
  const officer = await User.findOne({ role: 'officer' });
  if (!officer) {
    console.log('No officer found');
    process.exit();
  }
  const token = require('jsonwebtoken').sign({ id: officer._id, role: officer.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/visa/all', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response applications count:', data.applications ? data.applications.length : 'undefined');
  } catch (e) {
    console.error('Error fetching:', e.message);
  }
  process.exit();
}).catch(console.error);
