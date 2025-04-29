const User = require('../models/user.model');

const userController = {
    // Get all students
    getStudents: async (req, res) => {
        try {
            const students = await User.find({ role: 'student' })
                .select('-password') // Exclude password from response
                .sort({ createdAt: -1 }); // Sort by creation date, newest first

            res.status(200).json({
                success: true,
                data: students
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving students',
                error: error.message
            });
        }
    }
};

module.exports = userController;