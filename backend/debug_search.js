const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/evisa_db').then(async () => {
  const VisaApplication = require('./models/VisaApplication');
  const app = await VisaApplication.findOne();
  console.log('App:', app);
  process.exit(0);
});
