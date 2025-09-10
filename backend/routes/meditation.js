const express = require('express');
const auth = require('../middleware/auth');
const MeditationSession = require('../models/MeditationSession');

const router = express.Router();

// @route   POST /api/meditation/session
// @desc    Save meditation session
// @access  Private
router.post('/session', auth, async (req, res) => {
  try {
    const { duration, type, completedDuration } = req.body;

    const session = new MeditationSession({
      userId: req.user.id,
      duration,
      type,
      completedDuration
    });

    await session.save();

    // Calculate completion percentage
    const completionRate = ((completedDuration / duration) * 100).toFixed(1);

    res.json({
      session,
      completionRate
    });
  } catch (error) {
    console.error('Meditation session error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/meditation/sessions
// @desc    Get user's meditation sessions
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await MeditationSession.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 }).limit(parseInt(limit));

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, session) => sum + session.completedDuration, 0),
      averageSession: sessions.length > 0
        ? (sessions.reduce((sum, session) => sum + session.completedDuration, 0) / sessions.length).toFixed(1)
        : 0,
      streak: calculateMeditationStreak(sessions)
    };

    res.json({
      sessions,
      stats
    });
  } catch (error) {
    console.error('Get meditation sessions error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate meditation streak
const calculateMeditationStreak = (sessions) => {
  if (sessions.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  // Sort sessions by date (newest first)
  const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Check if there's a session today or yesterday
  let currentDate = new Date(today);
  
  for (let i = 0; i < 365; i++) { // Max streak of 365 days
    const hasSessionOnDate = sortedSessions.some(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === currentDate.toDateString();
    });
    
    if (hasSessionOnDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = router;