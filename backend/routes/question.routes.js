const express = require("express");
const router = express.Router();
const multer = require("multer"); // Thư viện để upload file pdf, doc, docx
const questionController = require("../controllers/question.controller");
const { auth, isTeacher } = require("../middlewares/auth.middleware");

// Cấu hình multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn file 5mb
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Định dạng file ${file.mimetype} không được hỗ trợ. Chỉ chấp nhận PDF, DOC, DOCX`
        )
      );
    }
  },
});

// Tạo câu hỏi từ file ( yêu cầu xác thực ( đăng ký, đăng nhập), là giáo viên)
router.post(
  "/generate",
  auth,
  isTeacher,
  upload.single("file"),
  questionController.generateQuestions
);

//  Lấy câu hỏi theo ID ( yêu cầu xác thực ( đăng ký, đăng nhập))
router.get("/:id", auth, questionController.getQuestionById);

// Lấy tất cả câu hỏi của một bài tập ( yêu cầu xác thực ( đăng ký, đăng nhập))
router.get("/exam/:examId", auth, questionController.getQuestionsByExamId);

module.exports = router;
