const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { jwtSecret, jwtExpiration } = require("../config/auth");

const register = async (req, res) => {
  try {
    console.log("Received registration request:", {
      ...req.body,
      password: "[HIDDEN]",
    });

    const { email, password, full_name, role } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      console.log("Missing required fields");
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Validate role
    if (role !== "teacher" && role !== "student") {
      console.log("Invalid role:", role);
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    // Check if user already exists
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }

    console.log("Creating new user...");
    // Create new user
    const newUser = await User.create({
      email,
      password,
      full_name,
      role,
    });
    console.log("User created successfully:", {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    });

    // Generate token
    const token = jwt.sign({ id: newUser.id }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
    });
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Received login request for email:", req.body.email);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log("Missing email or password");
      return res
        .status(400)
        .json({ message: "Vui lòng điền email và mật khẩu" });
    }

    // Check if user exists
    console.log("Finding user by email...");
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("User not found with email:", email);
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Check password
    console.log("Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email);
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    console.log("Login successful for user:", user.email);
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
