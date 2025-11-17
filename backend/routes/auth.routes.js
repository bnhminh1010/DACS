const express = require("express");
const router = express.Router(); // Tạo routes cho logic xác thực

// Xử lí logic đăng ký, đăng nhập, lấy thông tin profile
const {
  register,
  login,
  getProfile,
} = require("../controllers/auth.controller");

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Lấy thông tin profile
router.get("/profile", getProfile);

module.exports = router;
