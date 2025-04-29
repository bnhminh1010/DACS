const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn, giới hạn là 5MB' });
    }
    return res.status(400).json({ message: 'Lỗi upload file' });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Default error response
  res.status(500).json({
    message: 'Đã xảy ra lỗi trong quá trình xử lý',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;