const { Pool } = require("pg");
// Tạo một pool đăng nhập vào db ( pool giúp tái sử dụng kết nối, tối ưu hiệu năng khi có nhiều request đồng thời)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const Exam = {
  // Tạo bài kiểm tra
  async create(title, teacherId) {
    const query = {
      text: "INSERT INTO exams(title, teacher_id, created_at, updated_at) VALUES($1, $2, NOW(), NOW()) RETURNING *",
      values: [title, teacherId],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },
  // Lấy bài kiểm tra theo id giáo viên
  async findByTeacherId(teacherId) {
    const query = {
      text: "SELECT * FROM exams WHERE teacher_id = $1",
      values: [teacherId],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Lây bài kiểm tra bằng id exam
  async findById(examId) {
    const query = {
      text: "SELECT * FROM exams WHERE id = $1",
      values: [examId],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Trạng thái bài kiểm tra được public
  async updatePublishStatus(examId, isPublished) {
    const query = {
      text: "UPDATE exams SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      values: [isPublished, examId],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Lấy bái kiểm tra được public
  async getPublishedExams() {
    const result = await pool.query(
      "SELECT * FROM exams WHERE is_published = true"
    );
    return result.rows;
  },
};

module.exports = Exam;
