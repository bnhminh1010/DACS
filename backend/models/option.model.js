const db = require("../config/db"); // Liên kết db

const Option = {
  // Tạo đáp án ( Bao gồm mã câu hỏi, nội dung, đúng/sai )
  create: async (optionData) => {
    const { question_id, content, is_correct } = optionData;

    const query = `
      INSERT INTO options (question_id, content, is_correct)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    try {
      const result = await db.query(query, [question_id, content, is_correct]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Tìm kiếm đáp án theo mã câu hỏi
  findByQuestionId: async (questionId) => {
    const query = "SELECT * FROM options WHERE question_id = $1";

    try {
      const result = await db.query(query, [questionId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Option;
