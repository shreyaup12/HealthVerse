const mongoose = require('mongoose');

const meditationSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  type: {
    type: String,
    enum: ['breathing', 'mindfulness', 'sleep', 'focus'],
    default: 'breathing'
  },
  completedDuration: {
    type: Number,
    required: true // actual time spent in minutes
  },
  
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MeditationSession', meditationSessionSchema);