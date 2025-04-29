const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const extractTextFromFile = async (file) => {
  try {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const buffer = file.buffer;

    if (fileExt === ".txt") {
      return buffer.toString("utf8");
    } else if (fileExt === ".pdf") {
      const data = await pdf(buffer);
      return data.text;
    } else if (fileExt === ".doc" || fileExt === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error("Định dạng file không được hỗ trợ");
    }
  } catch (error) {
    console.error("Lỗi khi trích xuất file:", error);
    throw error;
  }
};

module.exports = {
  extractTextFromFile,
};
