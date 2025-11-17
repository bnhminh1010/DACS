const jwt = require("jsonwebtoken"); // Thư viện bảo mật jwt
const User = require("../models/user.model"); // Lấy model user để lấy dữ liệu từ db

const auth = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization từ request nơi client gửi token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token, lấy secret key từ file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user từ database ( id đã giải mã từ token)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Thêm thông tin user vào request để middleware và controller khác sử dụng
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Kiểm tra xem người dùng có quyền giáo viên không
const isTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
  next();
};

// Kiểm tra xem người dùng có quyền học sinh không
const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Chỉ học sinh mới có quyền truy cập" });
  }
  next();
};

module.exports = {
  auth,
  isTeacher,
  isStudent,
  verifyToken: auth, // Thêm alias cho compatibility
};
