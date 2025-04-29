const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attempt.controller');
const { auth, isStudent } = require('../middlewares/auth.middleware');

// Start an exam
router.post('/start/:id', auth, isStudent, attemptController.startExam);

// Submit an answer
router.post('/answer', auth, isStudent, attemptController.submitAnswer);

// Complete an exam
router.post('/complete/:id', auth, isStudent, attemptController.completeExam);

// Get attempt results
router.get('/:id/results', auth, attemptController.getAttemptResults);

// Get student's attempts
router.get('/student', auth, isStudent, attemptController.getStudentAttempts);

module.exports = router;