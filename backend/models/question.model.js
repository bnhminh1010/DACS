const { Pool } = require("pg");
const pool = require("../config/database");

class Question {
  static async create(questionData) {
    const { question, explanation, options, exam_id } = questionData;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert question
      const questionResult = await client.query(
        `INSERT INTO questions (content, explanation, exam_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [question, explanation, exam_id]
      );

      const questionId = questionResult.rows[0].id;

      // Insert options
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
