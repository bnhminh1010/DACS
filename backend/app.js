const express = require("express"); // Framework express
const cors = require("cors"); // cấu hình cors, vì xây dựng backend theo kiểu restful api, frontend và backend chạy theo 2 luồng api khác nhau
const morgan = require("morgan"); // Ghi log HTTP
const { Pool } = require("pg"); // Thư viện kết nối PostgreSQL
const authRoutes = require("./routes/auth.routes"); // Quản lý endpoint người dùng
const questionRoutes = require("./routes/question.routes"); // Quản lí endpoint câu hỏi
const examRoutes = require("./routes/exam.routes"); // Quản lý endpoint bài tập
const attemptRoutes = require("./routes/attempt.routes"); // Quản lý endpoint làm bài thi
require("dotenv").config(); // Dùng để đọc các thông tin quan trọng trong file .env

const app = express(); // Khởi tạo app bằng framework express

// Cấu hình CORS, chỉ cho phép domain trong origin truy cập ( localhost:5500)
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true,
    // Bảo mật hơn do chỉ cho phép các domain nhất định chạy hơn là cho phép tất cả
  })
);

// Middleware
app.use(morgan("dev")); // Thêm logging chi tiết ( method, url, status code, response time)
app.use(express.json({ limit: "10mb" })); // chuyển body JSON thành object JS, để đọc dữ liệu từ client
app.use(express.urlencoded({ extended: true })); // Phân tích dữ liệu thành form ( form-data)

// Khởi tạo kết nối PostgreSQL, cấu hình trong file .env
const pool = new Pool({
  // Tạo pool để kết nối, pool giúp tái sử dụng kết nối, tối ưu hiệu năng khi có nhiều request đồng thời
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test kết nối database, lỗi báo ra console
pool.connect((err, client, release) => {
  if (err) {
    console.error("Lỗi kết nối PostgreSQL:", err);
    return;
  }
  console.log("Đã kết nối thành công với PostgreSQL");
  release();
});

// Thêm pool vào app để sử dụng trong các route
app.locals.db = pool;

// Route để kiểm tra server còn hoạt động ko, trả về JSON xác nhận
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Gắn router con vào đường dẫn
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);

// Bắt mọi lỗi phát sinh, trả về mã 500, ghi ra log console
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Đã xảy ra lỗi!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Khởi động server trên cổng được chỉnh trong file .env hoặc cổng 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Cho phép import app ở file khác
module.exports = app;
