const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, isTeacher } = require('../middlewares/auth.middleware');

// Get all students (teachers only)
router.get('/students', auth, isTeacher, userController.getStudents);

module.exports = router;