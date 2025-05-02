require("dotenv").config(); // Lấy thông tin từ file .env

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key", // Khởi tạo JWT ( JSON WEB TOKEN )
  jwtExpiration: "24h", // Thời gian hết hạn JWT
  saltRounds: 10, // Số lần mã hóa mật khẩu bằng bcrypt
};
