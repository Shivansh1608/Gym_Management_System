const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const seedUsers = async () => {
    await connectDB();

    const users = [
        {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password',
            role: 'admin'
        },
        {
            name: 'Trainer User',
            email: 'trainer@example.com',
            password: 'password',
            role: 'trainer'
        },
        {
            name: 'Member User',
            email: 'member@example.com',
            password: 'password',
            role: 'member'
        }
    ];

    try {
        await User.deleteMany({});

        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await new User(user).save();
        }

        console.log('Users seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err) ;
        process.exit(1) ;
    }
};

seedUsers();
