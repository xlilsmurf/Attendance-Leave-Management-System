const Leave = require('../models/Leave');
const User = require('../models/User');

exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        
        const leave = new Leave({
            userId: req.user.id,
            leaveType,
            startDate,
            endDate,
            reason
        });
        
        await leave.save();
        res.status(201).json({ message: 'Leave applied successfully', leave });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('userId', 'name email employeeId department')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, comments } = req.body;
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        
        leave.status = status;
        leave.comments = comments;
        leave.approvedBy = req.user.id;
        
        await leave.save();
        res.json({ message: `Leave ${status} successfully`, leave });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};