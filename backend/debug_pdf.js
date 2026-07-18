const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/evisa_db').then(async () => {
  const VisaApplication = require('./models/VisaApplication');
  const app = await VisaApplication.findOne({ 'personalDetails.firstName': /abdilatif/i });
  console.log('App pdfUrl:', app.pdfUrl);
  process.exit(0);
});
