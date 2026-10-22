const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['functional', 'maintenance', 'broken'],
        default: 'functional'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);