const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingAttendance = await Attendance.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });
        
        if (existingAttendance && existingAttendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }
        
        const attendance = new Attendance({
            userId: req.user.id,
            date: new Date(),
            checkIn: new Date(),
            status: 'present'
        });
        
        await attendance.save();
        res.json({ message: 'Checked in successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });
        
        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'No check-in found for today' });
        }
        
        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out' });
        }
        
        attendance.checkOut = new Date();
        const workingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
        attendance.workingHours = parseFloat(workingHours.toFixed(2));
        
        await attendance.save();
        res.json({ message: 'Checked out successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.user.id };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('userId', 'name email employeeId department')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};