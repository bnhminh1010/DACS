const Exam = require("../models/exam.model");
const Question = require("../models/question.model");
const Option = require("../models/option.model");
const path = require("path");
const fs = require("fs");
const aiService = require("../services/ai.service");

const createExam = async (req, res) => {
  try {
    const { title, questions } = req.body;
    const teacherId = req.user._id; // Lấy từ middleware xác thực

    // Tạo bài tập mới
    const exam = await Exam.create(title, teacherId);

    // Tạo các câu hỏi cho bài tập
    const questionPromises = questions.map(async (q) => {
      return await Question.create({
        question: q.question,
        explanation: q.explanation,
        options: q.options || [],
        exam_id: exam.id,
      });
    });

    await Promise.all(questionPromises);
    // Auto-publish exam
    await Exam.updatePublishStatus(exam.id, true);

    res.status(201).json({
      success: true,
      message: "Tạo bài tập thành công",
      data: {
        examId: exam.id,
        title: exam.title,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài tập:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi tạo bài tập",
      error: error.message,
    });
  }
  // sau khi tạo exam
  
};

const getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.findByTeacherId(req.user.id);
    res.status(200).json({ exams });
  } catch (error) {
    console.error("Get teacher exams error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
    }

    // Check if the user is authorized to view this exam
    if (req.user.role === "teacher" && exam.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem bài kiểm tra này" });
    }

    // If user is a student, check if the exam is published
    if (req.user.role === "student" && !exam.is_published) {
      return res
        .status(403)
        .json({ message: "Bài kiểm tra này chưa được công bố" });
    }

    res.status(200).json({ exam });
  } catch (error) {
    console.error("Get exam by id error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const publishExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
    }

    // Check if user is the teacher who created the exam
    if (exam.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật bài kiểm tra này" });
    }

    const updatedExam = await Exam.updatePublishStatus(examId, true);

    res.status(200).json({
      message: "Bài kiểm tra đã được công bố",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Publish exam error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getPublishedExams = async (req, res) => {
  try {
    const exams = await Exam.getPublishedExams();
    res.status(200).json({ exams });
  } catch (error) {
    console.error("Get published exams error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  createExam,
  getTeacherExams,
  getExamById,
  publishExam,
  getPublishedExams,
};
