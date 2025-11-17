const multer = require("multer");

// Cấu hình storage cho multer
const storage = multer.memoryStorage();

// Cấu hình upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra loại file
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/msword"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file PDF hoặc Word"), false);
    }
  },
});

module.exports = upload;
