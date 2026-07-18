const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const VisaApplication = require('./models/VisaApplication');
  const now = new Date();
  
  console.time('DB_autoHeal_query');
  const enteredVisas = await VisaApplication.find({ entryStatus: 'Entered' });
  console.timeEnd('DB_autoHeal_query');
  
  console.time('DB_autoHeal_saves');
  for (let visa of enteredVisas) {
    if (visa.entryDate) {
      const correctExp = new Date(visa.entryDate);
      correctExp.setDate(correctExp.getDate() + (visa.visaDuration || 30));
      visa.expirationDate = correctExp;
      await visa.save();
    }
  }
  console.timeEnd('DB_autoHeal_saves');
  
  console.time('DB_overstays_query');
  const overstayedVisas = await VisaApplication.find({
    entryStatus: 'Entered',
    expirationDate: { $lt: now },
    overstayAlert: { $ne: true }
  });
  console.timeEnd('DB_overstays_query');
  
  console.time('DB_overstays_saves');
  for (let visa of overstayedVisas) {
    visa.overstayAlert = true;
    visa.entryStatus = 'Overstayed';
    await visa.save();
  }
  console.timeEnd('DB_overstays_saves');
  
  console.time('DB_getAll_query');
  const applications = await VisaApplication.find().populate('applicantId', 'fullName email').sort({ createdAt: -1 });
  console.timeEnd('DB_getAll_query');
  
  process.exit();
}).catch(console.error);
