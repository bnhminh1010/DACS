const { Pool } = require("pg"); // Thêm thư viện pool
const pool = require("../config/database"); // Tạo pool kết nối db

class Question {
  // Tạo câu hỏi ( truyền vào câu hỏi, giải thích, mã bài thi )
  static async create(questionData) {
    const { question, explanation, options, exam_id } = questionData;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Thêm câu hỏi
      const questionResult = await client.query(
        `INSERT INTO questions (content, explanation, exam_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [question, explanation, exam_id]
      );

      const questionId = questionResult.rows[0].id;

      // Thêm các lựa chọn
      for (const option of options) {
        await client.query(
          `INSERT INTO options (question_id, content, is_correct)
           VALUES ($1, $2, $3)`,
          [questionId, option.text, option.is_correct]
        );
      }

      await client.query("COMMIT");

      return questionId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Tìm kiếm câu hỏi theo id
  static async findById(id) {
    const result = await pool.query(
      `SELECT q.*, json_agg(json_build_object('id', o.id, 'content', o.content, 'is_correct', o.is_correct)) as options
       FROM questions q
       LEFT JOIN options o ON o.question_id = q.id
       WHERE q.id = $1
       GROUP BY q.id`,
      [id]
    );
    return result.rows[0];
  }

  // Tìm kiếm câu hỏi theo mã bài thi
  static async findByExamId(examId) {
    const result = await pool.query(
      `SELECT q.*, json_agg(json_build_object('id', o.id, 'content', o.content, 'is_correct', o.is_correct)) as options
       FROM questions q
       LEFT JOIN options o ON o.question_id = q.id
       WHERE q.exam_id = $1
       GROUP BY q.id`,
      [examId]
    );
    return result.rows;
  }
}

module.exports = Question;
