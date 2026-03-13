const mongoose = require("mongoose");

const calculateUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("CalculateUser", calculateUserSchema);