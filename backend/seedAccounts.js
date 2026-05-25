const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const pwdAdmin = await bcrypt.hash('admin123', 10);
  await db.collection('users').updateOne(
    { email: 'admin@evisa.gov.so' }, 
    { $set: { fullName: 'Admin', email: 'admin@evisa.gov.so', password: pwdAdmin, role: 'officer' } }, 
    { upsert: true }
  );
  
  const pwdAuditor = await bcrypt.hash('password123', 10);
  await db.collection('users').updateOne(
    { email: 'auditor@evisa.gov.so' }, 
    { $set: { fullName: 'System Auditor', email: 'auditor@evisa.gov.so', password: pwdAuditor, role: 'auditor' } }, 
    { upsert: true }
  );
  
  console.log('Seeded accounts to Atlas');
  process.exit(0);
}).catch(console.error);
