
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversations: [{
    message: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    isHealthcareRelated: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
