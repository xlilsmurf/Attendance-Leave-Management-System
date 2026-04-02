const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');

router.post('/apply', authMiddleware, applyLeave);
router.get('/my-leaves', authMiddleware, getMyLeaves);
router.get('/all', authMiddleware, adminMiddleware, getAllLeaves);
router.put('/:id/status', authMiddleware, adminMiddleware, updateLeaveStatus);

module.exports = router;