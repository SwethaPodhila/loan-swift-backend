const LoanApplication = require("../models/LoanApplication");
const twilio = require("twilio");
require("dotenv").config();
const nodemailer = require("nodemailer");
const CalculateUser = require("../models/CalculateUsers");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOtp = async (req, res) => {
    console.log("📩 Send OTP API called");

    const { phone } = req.body;
    console.log("📱 Phone received:", phone);

    if (!phone || phone.length !== 10) {
        console.log("❌ Invalid phone number");
        return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    try {

        console.log("🔍 Checking Twilio ENV variables...");
        console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "Loaded ✅" : "Missing ❌");
        console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded ✅" : "Missing ❌");
        console.log("TWILIO_SERVICE_SID:", process.env.TWILIO_SERVICE_SID ? "Loaded ✅" : "Missing ❌");

        console.log("📝 Creating loan application in DB...");

        const app = new LoanApplication({ phone, verified: false });

        await app.save();

        console.log("✅ Application saved in MongoDB:", app._id);

        console.log("📤 Sending OTP via Twilio...");

        const verification = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({
                to: `+91${phone}`,
                channel: "sms"
            });

        console.log("✅ Twilio response:", verification);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: app,
            otpStatus: verification.status
        });

    } catch (err) {

        console.log("🔥 ERROR OCCURRED");
        console.log("Error message:", err.message);
        console.log("Error code:", err.code);
        console.log("Full error:", err);

        return res.status(500).json({
            success: false,
            error: "Failed to send OTP",
            details: err.message
        });
    }
};

// 3️⃣ Verify OTP
exports.verifyOtp = async (req, res) => {

    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({
            success: false,
            error: "Phone and OTP required"
        });
    }

    try {

        const verification_check = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: `+91${phone}`,
                code: otp
            });

        if (verification_check.status === "approved") {

            // Update LoanApplication
            const app = await LoanApplication.findOneAndUpdate(
                { phone },
                { verified: true, otp },
                { new: true }
            );

            // Update CalculateUser
            const calcUser = await CalculateUser.findOneAndUpdate(
                { phone },
                { verified: true },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: "OTP verified",
                loanApplication: app,
                calculateUser: calcUser
            });

        } else {

            return res.status(400).json({
                success: false,
                error: "Invalid OTP"
            });

        }

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: "OTP verification failed"
        });

    }
};

// 4️⃣ Submit / Update Application
exports.updateApplication = async (req, res) => {
    const { id } = req.params; // application ID
    const updateData = req.body;

    try {
        const app = await LoanApplication.findByIdAndUpdate(id, updateData, { new: true });

        if (!app) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }

        res.status(200).json({ success: true, data: app });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error during submission" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await LoanApplication.find();
        res.status(200).json({ sucess: true, data: users });
        console.log(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error during fetching" })
    }
}

exports.sendContactMail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail", // or any SMTP
            auth: {
                user: process.env.ADMIN_EMAIL,       // admin email
                pass: process.env.ADMIN_PASSWORD,    // app password
            },
        });

        // Email to admin
        await transporter.sendMail({
            from: email,
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Message: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        // Email to user (confirmation)
        await transporter.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: `We received your message!`,
            text: `Hi ${name},\n\nThanks for contacting us. We received your message:\n"${message}"\n\nWe'll get back to you soon!`,
        });

        res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

exports.checkNumber = async (req, res) => {
    try {

        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Mobile number required"
            });
        }

        const user = await CalculateUser.findOne({ phone });

        if (user) {

            return res.json({
                exists: true,
                message: "User already exists"
            });

        } else {

            return res.json({
                exists: false,
                message: "User not found"
            });

        }

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.sendOtpCalcultor = async (req, res) => {

    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and number required" });
    }

    try {

        let user = await CalculateUser.findOne({ phone });

        if (!user) {

            user = new CalculateUser({
                name,
                phone,
                verified: false
            });

            await user.save();
        }

        const verification = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({
                to: `+91${phone}`,
                channel: "sms"
            });

        res.json({
            success: true,
            message: "OTP sent successfully",
            status: verification.status
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "OTP sending failed"
        });
    }
};