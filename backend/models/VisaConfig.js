const mongoose = require('mongoose');

const visaConfigSchema = new mongoose.Schema({
  visaType: { 
    type: String, 
    required: true, 
    unique: true 
  },
  options: [{
    duration: { type: Number, required: true }, // in days
    price: { type: Number, required: true } // in USD
  }]
}, { timestamps: true });

module.exports = mongoose.model('VisaConfig', visaConfigSchema);
