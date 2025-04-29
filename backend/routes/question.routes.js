const express = require("express");
const router = express.Router();
const multer = require("multer");
const questionController = require("../controllers/question.controller");
const { auth, isTeacher } = require("../middlewares/auth.middleware");

// Cấu hình multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// Route để tạo câu hỏi từ file
router.post(
  "/generate",
  auth,
  isTeacher,
  upload.single("file"),
  questionController.generateQuestions
);

// Route để lấy câu hỏi theo ID
router.get("/:id", auth, questionController.getQuestionById);

// Route để lấy tất cả câu hỏi của một bài tập
router.get("/exam/:examId", auth, questionController.getQuestionsByExamId);

module.exports = router;
