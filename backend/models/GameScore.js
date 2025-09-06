const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['reaction', 'hanoi', 'memory', 'focus']
  },
  score: {
    type: Number,
    required: true
  },
  details: {
    reactionTime: Number,
    moves: Number,
    level: Number,
    duration: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameScore', gameScoreSchema);
