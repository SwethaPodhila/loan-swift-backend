const LoanApplication = require("../models/LoanApplication");
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    try {
        const app = new LoanApplication({ phone, verified: false });
       // console.log("Creating application:", app);

        await app.save(); // <-- Make sure Mongoose is connected!
        //console.log("Application saved:", app._id);

        const verification = await client.verify
            .services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({ to: `+91${phone}`, channel: "sms" });

       // console.log("Twilio OTP response:", verification);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: app,
            otpStatus: verification.status
        });

    } catch (err) {
        console.error("Send OTP error:", err);
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
        return res.status(400).json({ success: false, error: "Phone and OTP required" });
    }

    try {
        const verification_check = await client.verify
            .services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({ to: `+91${phone}`, code: otp });

        if (verification_check.status === "approved") {
            // Update application verified field
            const app = await LoanApplication.findOneAndUpdate(
                { phone },
                { verified: true, otp },
                { new: true }
            );

            return res.status(200).json({ success: true, message: "OTP verified", data: app });
        } else {
            return res.status(400).json({ success: false, error: "Invalid OTP" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "OTP verification failed" });
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
