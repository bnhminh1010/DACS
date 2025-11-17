const express = require("express"); // Tự động chuyển request body dạng JSON
const cors = require("cors"); // Cho phép domain gọi api
const morgan = require("morgan"); // Cho phép ghi log request ra console
const app = express(); // Tạo một app express

// Middleware
app.use(cors()); // cho phép gọi api
app.use(express.json()); // trả về json
app.use(morgan("dev")); // ghi log request ra console

// Kiểm tra server hoạt động -> trả về ok
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gắn routes liên quan đến auth
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Bắt lỗi phát sinh, trả về mã 500, ghi ra log console
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Đã xảy ra lỗi trong quá trình xử lý yêu cầu",
  });
});

// Chạy server, PORT cấu hình trong file .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
