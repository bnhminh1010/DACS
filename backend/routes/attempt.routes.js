const express = require("express");
const router = express.Router(); // Tạo routes riêng cho làm bài thi
const attemptController = require("../controllers/attempt.controller"); // Controller xử lý logic
const { auth, isStudent } = require("../middlewares/auth.middleware"); // Middleware xác thực

// Bắt đầu bài kiểm tra ( Bắt buộc đăng nhập, Là học sinh)
// Khi nhấn bắt đầu thi, sẽ gọi api truyền id bài thi vào
router.post("/start/:id", auth, isStudent, attemptController.startExam);

// Nộp đán án ( Bắt buộc đăng nhập, Là học sinh)
// Khi nhấn nộp bài thi, sẽ gọi api này
router.post("/answer", auth, isStudent, attemptController.submitAnswer);

// Hoàn thành bài kiểm tra ( Bắt buộc đăng nhập, Là học sinh)
// Khi nhấn hoàn thành bài thi, sẽ gọi api ghi nhận hoàn thành
router.post("/complete/:id", auth, isStudent, attemptController.completeExam);

// Lấy lịch sử làm bài ( Bắt buộc đăng nhập, Là học sinh)
router.get("/student", auth, isStudent, attemptController.getStudentAttempts);

// Lấy thông tin lần làm bài (Bắt buộc đăng nhập)
router.get("/:id", auth, attemptController.getAttemptById);

// Lấy kết quả thi ( Bắt buộc đăng nhập )
router.get("/:id/results", auth, attemptController.getAttemptResults);

// Lấy danh sách câu trả lời của lần làm bài (Bắt buộc đăng nhập)
router.get("/:id/responses", auth, attemptController.getAttemptResponses);

// Xuất route ra để controller sử dụng
module.exports = router;
