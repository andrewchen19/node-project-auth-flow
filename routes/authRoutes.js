const express = require("express");
const router = express.Router();

const {
  register,
  verifiedEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authenticateUser } = require("../middleware/auth");

router.post("/register", register);
router.post("/verify-email", verifiedEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/logout", authenticateUser, logout);

module.exports = router;
