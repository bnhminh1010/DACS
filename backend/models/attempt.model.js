const db = require('../config/db');

const Attempt = {
  create: async (attemptData) => {
    const { student_id, exam_id } = attemptData;

    const query = `
      INSERT INTO attempts (student_id, exam_id)
      VALUES ($1, $2)
      RETURNING id, student_id, exam_id, start_time
    `;

    try {
      const result = await db.query(query, [student_id, exam_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    const query = 'SELECT * FROM attempts WHERE id = $1';

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  findByStudentAndExam: async (studentId, examId) => {
    const query = 'SELECT * FROM attempts WHERE student_id = $1 AND exam_id = $2';

    try {
      const result = await db.query(query, [studentId, examId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  getStudentAttempts: async (studentId) => {
    const query = `
      SELECT a.id, a.start_time, a.end_time, a.score, a.is_completed,
             e.title, e.description
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE a.student_id = $1
      ORDER BY a.start_time DESC
    `;

    try {
      const result = await db.query(query, [studentId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  complete: async (id, score) => {
    const query = `
      UPDATE attempts
      SET end_time = CURRENT_TIMESTAMP, score = $1, is_completed = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await db.query(query, [score, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Attempt;