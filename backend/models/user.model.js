const db = require("../config/db"); // Liên kết db
const bcrypt = require("bcrypt"); // Thư viện mã hóa mật khẩu
const { saltRounds } = require("../config/auth"); // Số vòng lặp mã hóa 

const User = {
  create: async (userData) => {
    const { email, password, full_name, role } = userData;
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Password hashed successfully");

    const query = `
      INSERT INTO users (email, password, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, role, created_at
    `;

    try {
      console.log("Executing query with parameters:", {
        email,
        hashedPassword: "[HIDDEN]",
        full_name,
        role,
      });
      const result = await db.query(query, [
        email,
        hashedPassword,
        full_name,
        role,
      ]);
      console.log("Query executed successfully. Result:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error executing query:", {
        code: error.code,
        message: error.message,
        detail: error.detail,
        table: error.table,
        constraint: error.constraint,
      });
      throw error;
    }
  },

  // Tìm kiếm người dùng theo email
  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";

    try {
      console.log("Finding user by email:", email);
      const result = await db.query(query, [email]);
      console.log(
        "Find by email result:",
        result.rows[0] ? "User found" : "User not found"
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  },

  // Tìm kiếm người dùng theo id
  findById: async (id) => {
    const query =
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = $1";

    try {
      console.log("Finding user by id:", id);
      const result = await db.query(query, [id]);
      console.log(
        "Find by id result:",
        result.rows[0] ? "User found" : "User not found"
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw error;
    }
  },

  // Lấy danh sách học sinh
  getStudents: async () => {
    const query =
      "SELECT id, email, full_name, created_at FROM users WHERE role = $1";

    try {
      const result = await db.query(query, ["student"]);
      console.log("Found", result.rows.length, "students");
      return result.rows;
    } catch (error) {
      console.error("Error getting students:", error);
      throw error;
    }
  },

  // Lấy danh sách giáo viên
  getTeachers: async () => {
    const query =
      "SELECT id, email, full_name, created_at FROM users WHERE role = $1";

    try {
      const result = await db.query(query, ["teacher"]);
      console.log("Found", result.rows.length, "teachers");
      return result.rows;
    } catch (error) {
      console.error("Error getting teachers:", error);
      throw error;
    }
  },
};

module.exports = User;
