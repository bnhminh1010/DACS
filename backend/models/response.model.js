const db = require('../config/db');

const Response = {
  // Tạo câu trả lời của sinh viên
  create: async (responseData) => {
    const { attempt_id, question_id, option_id } = responseData;

    const query = `
      INSERT INTO responses (attempt_id, question_id, option_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (attempt_id, question_id) 
      DO UPDATE SET option_id = $3
      RETURNING id
    `;

    try {
      const result = await db.query(query, [attempt_id, question_id, option_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  // Lấy bài kiểm tra theo id
  findByAttemptId: async (attemptId) => {
    const query = `
      SELECT r.*, q.content as question_content, o.content as option_content, o.is_correct
      FROM responses r
      JOIN questions q ON r.question_id = q.id
      JOIN options o ON r.option_id = o.id
      WHERE r.attempt_id = $1
    `;

    try {
      const result = await db.query(query, [attemptId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
  // Lấy kết quả bài kiểm tra 
  getAttemptResults: async (attemptId) => {
    const query = `
      SELECT 
        q.id as question_id,
        q.content as question_content,
        q.explanation,
        r.option_id as selected_option_id,
        correct.id as correct_option_id,
        correct.content as correct_option_content,
        selected.content as selected_option_content,
        selected.is_correct = true as is_correct
      FROM questions q
      JOIN attempts a ON q.exam_id = a.exam_id
      LEFT JOIN responses r ON r.question_id = q.id AND r.attempt_id = a.id
      LEFT JOIN options selected ON r.option_id = selected.id
      JOIN options correct ON correct.question_id = q.id AND correct.is_correct = true
      WHERE a.id = $1
      ORDER BY q.id
    `;

    try {
      const result = await db.query(query, [attemptId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Response;