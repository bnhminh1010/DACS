const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller");
const { auth, isTeacher } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Create a new exam (teachers only)
router.post(
  "/",
  auth,
  isTeacher,
  upload.single("file"),
  examController.createExam
);

// Get teacher's exams
router.get("/teacher", auth, isTeacher, examController.getTeacherExams);

// Get published exams
router.get("/published", auth, examController.getPublishedExams);

// Get exam by id
router.get("/:id", auth, examController.getExamById);

// Publish exam
router.patch("/:id/publish", auth, isTeacher, examController.publishExam);

// Route tạo bài tập mới
router.post("/create", auth, isTeacher, examController.createExam);

module.exports = router;
