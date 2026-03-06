const express = require("express");
const router = express.Router();
const loanController = require("../controller/loanController");

// Loan application routes
//router.post("/", loanController.createApplication);
//router.get("/", loanController.getApplications);
//router.get("/:id", loanController.getApplicationById);
//router.put("/:id", loanController.updateApplication);

// OTP routes
router.post("/send-otp", loanController.sendOtp);
router.post("/verify-otp", loanController.verifyOtp);
router.put("/:id", loanController.updateApplication); // Update application after OTP verification

module.exports = router;