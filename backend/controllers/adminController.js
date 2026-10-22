const Equipment = require('../models/Equipment');
const User = require('../models/User');

exports.addEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.create({
            name: req.body.name,
            quantity: req.body.quantity,
            status: req.body.status
        });

        return res.json(equipment);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

exports.getEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find();
        return res.json(equipment);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.json(users);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};
