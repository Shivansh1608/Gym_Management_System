const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId) => {
    const payload = { user: { id: userId } };
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });
};

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', msg: 'User already exists', message: 'User already exists' });
        }

        // Create new user object
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'member'
        });

        // Generate token
        const token = generateToken(newUser.id);

        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        return res.json({
            status: 'success',
            token,
            role: newUser.role,
            name: newUser.name,
            data: {
                token,
                user: userData
            }
        });
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 'fail', msg: 'Invalid Credentials', message: 'Invalid Credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ status: 'fail', msg: 'Invalid Credentials', message: 'Invalid Credentials' });
        }

        const token = generateToken(user.id);

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.json({
            status: 'success',
            token,
            role: user.role,
            name: user.name,
            data: {
                token,
                user: userData
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// ------------------ GET CURRENT USER ------------------
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ status: 'fail', msg: 'User not found', message: 'User not found' });
        }

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.json({
            status: 'success',
            ...userData,
            data: {
                user: userData
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server error' });
    }
};
