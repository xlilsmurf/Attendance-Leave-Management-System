const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance
} = require('../controllers/attendanceController');

router.post('/checkin', authMiddleware, checkIn);
router.post('/checkout', authMiddleware, checkOut);
router.get('/my-attendance', authMiddleware, getMyAttendance);
router.get('/all', authMiddleware, adminMiddleware, getAllAttendance);

module.exports = router;