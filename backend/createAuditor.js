const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 

mongoose.connect('mongodb://127.0.0.1:27017/evisa', { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => { 
  const db = mongoose.connection.db; 
  const hashedPassword = await bcrypt.hash('password123', 10); 
  await db.collection('users').updateOne(
    { email: 'auditor@evisa.gov.so' }, 
    { $set: { 
        fullName: 'Chief Auditor', 
        email: 'auditor@evisa.gov.so', 
        password: hashedPassword, 
        role: 'auditor', 
        phone: '+252 61 1234567', 
        nationality: 'Somalia', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      } 
    }, 
    { upsert: true }
  ); 
  console.log('Auditor account created successfully.'); 
  process.exit(0); 
});
