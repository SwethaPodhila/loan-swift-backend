const express = require("express");
const router = express.Router();

const { adminSignup, adminLogin, createSubAdmin, getSubAdmins, updateSubAdmin, deleteSubAdmin } = require("../controller/adminController.js");
const { verifyToken } = require("../middleware/auth");

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);

router.post("/create-sub-admin", verifyToken, createSubAdmin);
router.get("/sub-admins", verifyToken, getSubAdmins);
router.put("/sub-admin/:id", verifyToken, updateSubAdmin);
router.delete("/sub-admin/:id", verifyToken, deleteSubAdmin);

module.exports = router;