const { Pool } = require("pg");
require("dotenv").config();

console.log("Initializing database connection with parameters:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Không log mật khẩu
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection and create table if not exists
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("Error acquiring client:", err.stack);
    console.error("Database connection parameters:", {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    return;
  }

  try {
    // Kiểm tra kết nối
    const testResult = await client.query("SELECT NOW()");
    console.log("Database connected successfully at:", testResult.rows[0].now);

    // Kiểm tra và tạo bảng users nếu chưa tồn tại
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log("Creating users table...");
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Users table created successfully");
    } else {
      console.log("Users table already exists");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  } finally {
    release();
  }
});

// Wrap the pool.query to add logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    console.log("Executing query:", {
      text,
      params: params ? "[PARAMS HIDDEN]" : "no parameters",
    });
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Query executed successfully:", {
      duration,
      rowCount: result.rowCount,
      command: result.command,
    });
    return result;
  } catch (error) {
    console.error("Query error:", {
      text,
      error: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
    throw error;
  }
};

module.exports = {
  query,
};
