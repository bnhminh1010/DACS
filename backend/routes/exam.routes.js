const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller"); // Xử lí logic liên quan đến bài thi
const { auth, isTeacher } = require("../middlewares/auth.middleware"); // Xử lí logic xác thực
const upload = require("../middlewares/upload.middleware"); // Xử lí logic upload file

// Tạo bài thi ( yêu cầu xác thực ( đăng ký, đăng nhập), là giáo viên, upload file)
router.post(
  "/",
  auth,
  isTeacher,
  upload.single("file"),
  examController.createExam
);

// Lấy danh sách bài thi của giáo viên ( yêu cầu xác thực ( đăng ký, đăng nhập), là giáo viên)
router.get("/teacher", auth, isTeacher, examController.getTeacherExams);

// Lấy danh sách bài thi đã triển khai ( Xác thực ( đăng ký, đăng nhập))
router.get("/published", auth, examController.getPublishedExams);

// Lấy bài thi theo id ( yêu cầu xác thực ( đăng ký, đăng nhập))
router.get("/:id", auth, examController.getExamById);

// Triển khai bài thi ( yêu cầu xác thực ( đăng ký, đăng nhập))
// Hiện tại đăng ko sử dụng ( Bài thi được tạo sẽ auto public)
router.patch("/:id/publish", auth, isTeacher, examController.publishExam);

// Tạo bài tập mới ( yêu cầu xác thực ( đăng ký, đăng nhập), là giáo viên)
router.post("/create", auth, isTeacher, examController.createExam);

module.exports = router;
