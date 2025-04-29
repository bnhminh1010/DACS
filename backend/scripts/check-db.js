const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkDatabase() {
  try {
    // Kiểm tra kết nối
    console.log("Checking database connection...");
    const client = await pool.connect();

    // Kiểm tra bảng users
    console.log("\nChecking users table...");
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✓ Users table exists");

      // Kiểm tra cấu trúc bảng
      console.log("\nChecking table structure...");
      const columns = await client.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'users';
      `);

      console.log("Table columns:");
      columns.rows.forEach((col) => {
        console.log(
          `- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ""}`
        );
      });

      // Kiểm tra số lượng record
      const count = await client.query("SELECT COUNT(*) FROM users;");
      console.log(`\nTotal records in users table: ${count.rows[0].count}`);
    } else {
      console.log("✗ Users table does not exist!");
      console.log("\nCreating users table...");

      // Tạo bảng users nếu chưa tồn tại
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

      console.log("✓ Users table created successfully");
    }

    client.release();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

checkDatabase();
