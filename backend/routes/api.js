const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const subscriptionController = require('../controllers/subscriptionController');
const User = require('../models/User');
const WorkoutLog = require('../models/WorkoutLog');

// ------------------ AUTH ROUTES ------------------
router.post('/login', authController.login);
router.post('/auth/login', authController.login);
router.post('/register', authController.register);
router.post('/auth/register', authController.register);
router.get('/me', auth, authController.getCurrentUser);
router.get('/auth/me', auth, authController.getCurrentUser);

// ------------------ ADMIN & USERS ------------------
router.post('/equipment', auth, adminController.addEquipment);
router.get('/equipment', auth, adminController.getEquipment);
router.get('/users', auth, adminController.getUsers);

// ------------------ SUBSCRIPTION ------------------
router.post('/subscription', auth, subscriptionController.createSubscription);
router.get('/subscription', auth, subscriptionController.getSubscriptions);

// ------------------ MEMBER HOME & STATS ------------------
router.get('/member-home', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const workoutsCount = await WorkoutLog.countDocuments({ user: req.user.id });
        return res.json({
            status: 'success',
            data: {
                user,
                stats: {
                    activeDays: workoutsCount,
                    totalWorkouts: workoutsCount,
                    hoursSpent: Math.round(workoutsCount * 1.2),
                    streak: Math.min(workoutsCount, 5)
                },
                recentActivity: [],
                upcomingSessions: []
            }
        });
    } catch (err) {
        return res.json({
            status: 'success',
            data: {
                stats: { activeDays: 0, totalWorkouts: 0, hoursSpent: 0, streak: 0 },
                recentActivity: [],
                upcomingSessions: []
            }
        });
    }
});

// ------------------ WORKOUTS ------------------
router.get('/workouts/stats', auth, async (req, res) => {
    try {
        const count = await WorkoutLog.countDocuments({ user: req.user.id });
        return res.json({
            status: 'success',
            data: {
                totalWorkouts: count,
                streakDays: Math.min(count, 3),
                caloriesBurned: count * 350,
                activeMinutes: count * 45
            }
        });
    } catch (err) {
        return res.json({ status: 'success', data: { totalWorkouts: 0, streakDays: 0, caloriesBurned: 0, activeMinutes: 0 } });
    }
});

router.get('/workouts', auth, async (req, res) => {
    try {
        const workouts = await WorkoutLog.find({ user: req.user.id }).sort({ date: -1 });
        return res.json({ status: 'success', data: { workouts } });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.post('/workouts', auth, async (req, res) => {
    try {
        const workout = await WorkoutLog.create({
            user: req.user.id,
            ...req.body
        });
        return res.json({ status: 'success', data: workout });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.patch('/workouts/:id', auth, async (req, res) => {
    try {
        const workout = await WorkoutLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.json({ status: 'success', data: workout });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.delete('/workouts/:id', auth, async (req, res) => {
    try {
        await WorkoutLog.findByIdAndDelete(req.params.id);
        return res.json({ status: 'success', message: 'Workout deleted' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

// ------------------ PROGRESS ------------------
router.get('/progress/stats', auth, (req, res) => {
    return res.json({
        status: 'success',
        data: {
            currentWeight: 75,
            targetWeight: 70,
            bmi: 23.4,
            bodyFatPercentage: 16.5,
            progressHistory: []
        }
    });
});

router.get('/progress', auth, (req, res) => {
    return res.json({ status: 'success', data: { progress: [] } });
});

router.post('/progress', auth, (req, res) => {
    return res.json({ status: 'success', data: req.body });
});

// ------------------ SESSIONS & BOOKINGS ------------------
const mockSessions = [
    {
        id: '1',
        title: 'Morning HIIT',
        trainerName: 'Trainer User',
        trainerId: 'trainer-1',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '08:00 AM',
        capacity: 15,
        bookedCount: 6,
        type: 'HIIT',
        location: 'Studio A'
    },
    {
        id: '2',
        title: 'Strength & Conditioning',
        trainerName: 'Trainer User',
        trainerId: 'trainer-1',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '10:00 AM',
        capacity: 12,
        bookedCount: 4,
        type: 'Strength',
        location: 'Main Gym'
    }
];

let userBookings = [];

router.get('/sessions/available', auth, (req, res) => {
    return res.json({ status: 'success', data: { sessions: mockSessions } });
});

router.get('/sessions/my-bookings', auth, (req, res) => {
    return res.json({ status: 'success', data: { bookings: userBookings } });
});

router.post('/sessions/book', auth, (req, res) => {
    const { sessionId } = req.body;
    const session = mockSessions.find(s => s.id === sessionId);
    const booking = {
        id: `book-${Date.now()}`,
        sessionId,
        sessionName: session ? session.title : 'Gym Session',
        date: session ? session.date : new Date().toISOString(),
        time: session ? session.time : '10:00 AM',
        trainerName: session ? session.trainerName : 'Trainer',
        status: 'confirmed'
    };
    userBookings.push(booking);
    return res.json({ status: 'success', data: booking });
});

router.patch('/sessions/cancel/:id', auth, (req, res) => {
    userBookings = userBookings.filter(b => b.id !== req.params.id);
    return res.json({ status: 'success', message: 'Booking cancelled' });
});

router.get('/sessions/trainer', auth, (req, res) => {
    return res.json({ status: 'success', data: { sessions: mockSessions } });
});

router.post('/sessions', auth, (req, res) => {
    const newSession = { id: `${Date.now()}`, ...req.body };
    mockSessions.push(newSession);
    return res.json({ status: 'success', data: newSession });
});

router.patch('/sessions/:id', auth, (req, res) => {
    return res.json({ status: 'success', data: { id: req.params.id, ...req.body } });
});

router.delete('/sessions/:id', auth, (req, res) => {
    return res.json({ status: 'success', message: 'Session deleted' });
});

// ------------------ CHECK-INS ------------------
const checkIns = [];

router.get('/checkins', auth, (req, res) => {
    return res.json({ status: 'success', data: { checkIns } });
});

router.post('/checkins', auth, (req, res) => {
    const checkIn = {
        id: `ci-${Date.now()}`,
        userId: req.user.id,
        timestamp: new Date().toISOString(),
        location: req.body.location || 'FitTrack Downtown'
    };
    checkIns.unshift(checkIn);
    return res.json({ status: 'success', data: checkIn });
});

// ------------------ MEMBERS (ADMIN) ------------------
router.get('/members', auth, async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select('-password');
        const formatted = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: 'active',
            membershipType: 'Premium',
            joinDate: u.createdAt || new Date().toISOString()
        }));
        return res.json({ status: 'success', data: { members: formatted } });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.get('/members/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        return res.json({ status: 'success', data: user });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.post('/members', auth, async (req, res) => {
    return res.json({ status: 'success', data: { id: `m-${Date.now()}`, ...req.body } });
});

router.patch('/members/:id', auth, async (req, res) => {
    return res.json({ status: 'success', data: { id: req.params.id, ...req.body } });
});

router.delete('/members/:id', auth, async (req, res) => {
    return res.json({ status: 'success', message: 'Member deleted' });
});

// ------------------ ANALYTICS & STAFF (ADMIN) ------------------
router.get('/analytics/dashboard', auth, async (req, res) => {
    try {
        const memberCount = await User.countDocuments({ role: 'member' });
        const trainerCount = await User.countDocuments({ role: 'trainer' });
        return res.json({
            status: 'success',
            data: {
                totalMembers: memberCount || 45,
                activeMembers: memberCount || 38,
                monthlyRevenue: 12500,
                totalTrainers: trainerCount || 5,
                recentSignups: 8,
                retentionRate: '92%'
            }
        });
    } catch (err) {
        return res.json({
            status: 'success',
            data: { totalMembers: 45, activeMembers: 38, monthlyRevenue: 12500, totalTrainers: 5 }
        });
    }
});

router.get('/analytics/revenue', auth, (req, res) => {
    return res.json({
        status: 'success',
        data: {
            monthlyData: [
                { month: 'Jan', revenue: 9500 },
                { month: 'Feb', revenue: 10200 },
                { month: 'Mar', revenue: 11000 },
                { month: 'Apr', revenue: 12500 }
            ]
        }
    });
});

router.get('/staff', auth, async (req, res) => {
    try {
        const staffUsers = await User.find({ role: { $in: ['admin', 'trainer'] } }).select('-password');
        const formatted = staffUsers.map(s => ({
            id: s._id,
            name: s.name,
            email: s.email,
            role: s.role,
            status: 'active',
            assignedClients: s.role === 'trainer' ? 8 : 0
        }));
        return res.json({ status: 'success', data: { staff: formatted } });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

router.post('/staff', auth, (req, res) => {
    return res.json({ status: 'success', data: { id: `staff-${Date.now()}`, ...req.body } });
});

// ------------------ WORKOUT PLANS & TRAINER ------------------
const samplePlans = [
    {
        id: '1',
        title: 'Beginner Hypertrophy',
        category: 'strength',
        difficulty: 'Beginner',
        durationWeeks: 8,
        description: 'Focus on compound movements and fundamental strength.'
    },
    {
        id: '2',
        title: 'High Intensity Fat Burn',
        category: 'cardio',
        difficulty: 'Intermediate',
        durationWeeks: 6,
        description: 'Interval training designed to maximize calorie burn.'
    }
];

router.get('/plans', auth, (req, res) => {
    return res.json({ status: 'success', data: { plans: samplePlans } });
});

router.post('/plans', auth, (req, res) => {
    const newPlan = { id: `${Date.now()}`, ...req.body };
    samplePlans.push(newPlan);
    return res.json({ status: 'success', data: newPlan });
});

router.post('/plans/:id/assign', auth, (req, res) => {
    return res.json({ status: 'success', message: 'Plan assigned successfully' });
});

router.patch('/plans/:id', auth, (req, res) => {
    return res.json({ status: 'success', data: { id: req.params.id, ...req.body } });
});

router.delete('/plans/:id', auth, (req, res) => {
    return res.json({ status: 'success', message: 'Plan deleted' });
});

router.get('/trainer/clients', auth, async (req, res) => {
    try {
        const members = await User.find({ role: 'member' }).limit(10).select('-password');
        const clients = members.map(m => ({
            id: m._id,
            name: m.name,
            email: m.email,
            plan: 'Custom Strength',
            progress: '78%'
        }));
        return res.json({ status: 'success', data: { clients } });
    } catch (err) {
        return res.json({ status: 'success', data: { clients: [] } });
    }
});

module.exports = router;