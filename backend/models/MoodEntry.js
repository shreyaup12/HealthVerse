
const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  activities: [{
    type: String,
    enum: ['exercise', 'meditation', 'reading', 'sleep', 'work', 'social', 'hobby', 'outdoor']
  }],
  journalEntry: {
    type: String,
    maxLength: 1000
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
