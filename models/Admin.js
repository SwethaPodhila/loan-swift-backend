const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: false
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["super_admin", "sub_admin"], // 🔥 important
        default: "sub_admin"
    }

}, { timestamps: true })

module.exports = mongoose.model("Admin", adminSchema)