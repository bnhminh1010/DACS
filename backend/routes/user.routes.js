const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, isTeacher } = require('../middlewares/auth.middleware');

// Xem tất cả học sinh ( yêu cầu xác thực ( đăng ký, đăng nhập), là giáo viên)
router.get('/students', auth, isTeacher, userController.getStudents);

module.exports = router;