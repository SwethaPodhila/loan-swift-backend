const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY

// ADMIN SIGNUP
exports.adminSignup = async (req, res) => {

    try {

        const { email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            email,
            phone,
            password: hashedPassword,
            role: "admin"
        });

        await newAdmin.save();


        // JWT TOKEN
        const token = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.status(201).json({ 
            message: "Admin registered successfully",
            token,
            admin: newAdmin
        });

    } catch (error) {
        console.log("Signup Error:", error);
        res.status(500).json({
            message: "Server error",
            error
        });

    }

};

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }


        // JWT TOKEN
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            admin
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }

};