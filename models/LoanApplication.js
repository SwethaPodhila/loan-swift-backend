const mongoose = require("mongoose");

const LoanApplicationSchema = new mongoose.Schema({
  name: { type: String, required: false },
  dob: { type: Date, required: false },
  phone: { type: String, required: true },
  email: { type: String },
  otp: { type: String },
  verified: { type: Boolean, default: false },

  loanType: { type: String },
  income: { type: Number },
  employment: { type: String },

  cibil: { type: Number },
  emi: { type: Number },

  address: { type: String },
  pincode: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);