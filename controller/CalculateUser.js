const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    number: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    calculatorUsed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);