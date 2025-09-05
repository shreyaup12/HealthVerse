
// routes/mood.js
const express = require('express');
const auth = require('../middleware/auth');
const MoodEntry = require('../models/MoodEntry');

const router = express.Router();

// @route   POST /api/mood
// @desc    Create mood entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { mood, activities, journalEntry } = req.body;

    const moodEntry = new MoodEntry({
      userId: req.user.id,
      mood,
      activities,
      journalEntry
    });

    await moodEntry.save();
    res.json(moodEntry);
  } catch (error) {
    console.error('Mood entry error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mood
// @desc    Get user's mood entries
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodEntries = await MoodEntry.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate mood statistics
    const stats = {
      totalEntries: moodEntries.length,
      averageMood: moodEntries.length > 0 
        ? (moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)
        : 0,
      moodTrend: calculateMoodTrend(moodEntries)
    };

    res.json({
      entries: moodEntries,
      stats
    });
  } catch (error) {
    console.error('Get mood entries error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate mood trend
const calculateMoodTrend = (entries) => {
  if (entries.length < 2) return 'neutral';
  
  const recent = entries.slice(0, 7);
  const earlier = entries.slice(7, 14);
  
  if (recent.length === 0 || earlier.length === 0) return 'neutral';
  
  const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, entry) => sum + entry.mood, 0) / earlier.length;
  
  const difference = recentAvg - earlierAvg;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

module.exports = router;
