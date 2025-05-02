const { Pool } = require("pg"); // Lấy thư viện pg kết nối db
require("dotenv").config(); // Lấy thông tin từ file .env


// Tạo một pool kết nối db, pool giúp tái sử dụng kết nối, tối ưu hiệu năng khi có nhiều request đồng thời
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Log thông tin kết nối
console.log("Initializing database connection with parameters:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = pool; // xuất ra pool để sử dụng trong các route
