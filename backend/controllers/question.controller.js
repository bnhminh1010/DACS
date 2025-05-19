const aiService = require("../services/ai.service");
const Question = require("../models/question.model");

const questionController = {
  generateQuestions: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng tải lên một file",
        });
      }

      // Chuyển file buffer thành base64
      const base64Content = req.file.buffer.toString("base64");

      // Gọi service để tạo câu hỏi
      const specialty = req.body.specialty || req.fields?.specialty || "math";
      const difficulty =
        req.body.difficulty || req.fields?.difficulty || "easy";
      const questions = await aiService.generateQuestions(
        req.file.originalname,
        base64Content,
        specialty,
        difficulty
      );

      res.json(questions);
    } catch (error) {
      console.error("Lỗi khi tạo câu hỏi:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Có lỗi xảy ra khi tạo câu hỏi",
      });
    }
  },

  getQuestionById: async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy câu hỏi",
        });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thông tin câu hỏi",
      });
    }
  },

  getQuestionsByExamId: async (req, res) => {
    try {
      const questions = await Question.findByExamId(req.params.examId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy danh sách câu hỏi",
      });
    }
  },
};

module.exports = questionController;
