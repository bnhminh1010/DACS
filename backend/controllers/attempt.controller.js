const Attempt = require("../models/attempt.model"); // Dùng khi cần tương tác dữ liệu ở bảng attempt ( bài làm )
const Response = require("../models/response.model"); // Tương tự ở bảng respone ( câu trả lời )
const Exam = require("../models/exam.model"); // Tương tự
const Question = require("../models/question.model"); // Tương tự


// Khởi tạo bài làm của sinh viên
const startExam = async (req, res) => {
  try {
    // Sử dụng khi cần xác định bài kiểm tra mà sinh viên muốn làm theo id

    const examId = req.params.id;

    // Kiểm tra bài làm của sinh viên tồn tại và đã được mở
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
    }

    if (!exam.is_published) {
      return res
        .status(403)
        .json({ message: "Bài kiểm tra này chưa được công bố" });
    }

    // Kiểm tra sinh viên đã làm bài làm này rồi
    const existingAttempt = await Attempt.findByStudentAndExam(
      req.user.id,
      examId
    );
    if (existingAttempt && existingAttempt.is_completed) {
      return res.status(400).json({
        message: "Bạn đã hoàn thành bài kiểm tra này",
        attemptId: existingAttempt.id,
      });
    }
    // Chưa nộp bài thì tiếp tục làm tiếp
    if (existingAttempt && !existingAttempt.is_completed) {
      return res.status(200).json({
        message: "Tiếp tục làm bài kiểm tra",
        attempt: existingAttempt,
      });
    }

    // Tạo bài làm, nếu sinh viên chưa làm
    const attemptData = {
      student_id: req.user.id,
      exam_id: examId,
    };
    // lấy id học sinh và id bài thi ra để tạo bài làm
    const attempt = await Attempt.create(attemptData);

    res.status(201).json({
      message: "Bắt đầu làm bài kiểm tra",
      attempt,
    });
  } catch (error) {
    console.error("Start exam error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, optionId } = req.body;

    if (!attemptId || !questionId || !optionId) {
      return res.status(400).json({ message: "Thiếu thông tin câu trả lời" });
    }

    // Check if attempt exists and belongs to user
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
    }

    if (attempt.student_id !== req.user.id) {
      return res.status(403).json({
        message: "Bạn không có quyền gửi câu trả lời cho lần làm bài này",
      });
    }

    if (attempt.is_completed) {
      return res
        .status(400)
        .json({ message: "Bài kiểm tra đã được hoàn thành" });
    }

    // Save response
    const responseData = {
      attempt_id: attemptId,
      question_id: questionId,
      option_id: optionId,
    };

    await Response.create(responseData);

    res.status(200).json({ message: "Đã lưu câu trả lời" });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const completeExam = async (req, res) => {
  try {
    console.log("Bắt đầu hoàn thành bài thi", req.params);
    const attemptId = req.params.id;

    // Check if attempt exists and belongs to user
    const attempt = await Attempt.findById(attemptId);
    console.log("Thông tin attempt:", attempt);

    if (!attempt) {
      return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
    }

    if (attempt.student_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hoàn thành lần làm bài này" });
    }

    if (attempt.is_completed) {
      return res
        .status(400)
        .json({ message: "Bài kiểm tra đã được hoàn thành" });
    }

    // Get exam with questions
    const exam = await Exam.findById(attempt.exam_id);
    console.log("Thông tin exam:", exam);

    const questions = await Question.findByExamId(attempt.exam_id);
    console.log("Số lượng câu hỏi:", questions.length);

    // Get student responses
    const responses = await Response.findByAttemptId(attemptId);
    console.log(
      "Số lượng câu trả lời:",
      responses.length,
      "Dữ liệu:",
      responses
    );

    // Kiểm tra có câu trả lời nào không
    if (!responses || responses.length === 0) {
      console.log("Không có câu trả lời nào, gắn điểm là 0");
      const completedAttempt = await Attempt.complete(attemptId, 0);
      return res.status(200).json({
        message: "Bài kiểm tra đã hoàn thành nhưng không có câu trả lời nào",
        attempt: completedAttempt,
        score: 0,
        correctAnswers: 0,
        totalQuestions: questions.length,
      });
    }

    // Calculate score
    let correctAnswers = 0;

    for (const response of responses) {
      console.log("Kiểm tra câu trả lời:", response);
      if (response.is_correct) {
        correctAnswers++;
      }
    }

    const totalQuestions = questions.length;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 10 : 0;
    console.log(`Điểm số: ${correctAnswers}/${totalQuestions} = ${score}`);

    // Update attempt as completed
    const completedAttempt = await Attempt.complete(attemptId, score);
    console.log("Đã hoàn thành bài thi:", completedAttempt);

    res.status(200).json({
      message: "Bài kiểm tra đã hoàn thành",
      attempt: completedAttempt,
      score,
      correctAnswers,
      totalQuestions,
    });
  } catch (error) {
    console.error("Complete exam error:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

const getAttemptResults = async (req, res) => {
  try {
    const attemptId = req.params.id;

    // Check if attempt exists and belongs to user
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
    }

    if (attempt.student_id !== req.user.id && req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem kết quả này" });
    }

    if (!attempt.is_completed) {
      return res.status(400).json({ message: "Bài kiểm tra chưa hoàn thành" });
    }

    // Get detailed results
    const results = await Response.getAttemptResults(attemptId);

    res.status(200).json({
      attempt,
      results,
    });
  } catch (error) {
    console.error("Get attempt results error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getStudentAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.getStudentAttempts(req.user.id);

    res.status(200).json({ attempts });
  } catch (error) {
    console.error("Get student attempts error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getAttemptById = async (req, res) => {
  try {
    const attemptId = req.params.id;

    // Kiểm tra tồn tại và quyền truy cập
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
    }

    if (attempt.student_id !== req.user.id && req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem thông tin này" });
    }

    // Lấy thông tin bài thi
    const exam = await Exam.findById(attempt.exam_id);

    res.status(200).json({
      attempt,
      exam_title: exam ? exam.title : null,
      exam_description: exam ? exam.description : null,
    });
  } catch (error) {
    console.error("Get attempt by id error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getAttemptResponses = async (req, res) => {
  try {
    const attemptId = req.params.id;

    // Kiểm tra tồn tại và quyền truy cập
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
    }

    if (attempt.student_id !== req.user.id && req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem thông tin này" });
    }

    // Lấy danh sách câu trả lời
    const responses = await Response.findByAttemptId(attemptId);

    res.status(200).json(responses);
  } catch (error) {
    console.error("Get attempt responses error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  startExam,
  submitAnswer,
  completeExam,
  getAttemptById,
  getAttemptResults,
  getAttemptResponses,
  getStudentAttempts,
};
