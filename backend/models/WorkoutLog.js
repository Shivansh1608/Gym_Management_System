const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    exercises: [
        {
            name: String,
            sets: Number,
            reps: Number,
            weight: Number
        }
    ]
});

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);