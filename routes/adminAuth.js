const express = require("express");
const router = express.Router();

const { adminSignup, adminLogin } = require("../controller/adminController.js");

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);

module.exports = router;