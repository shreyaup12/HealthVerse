const express = require('express');
const auth = require('../middleware/auth');
const GameScore = require('../models/GameScore');

const router = express.Router();

// @route   POST /api/games/score
// @desc    Save game score
// @access  Private
router.post('/score', auth, async (req, res) => {
  try {
    const { gameType, score, details } = req.body;

    const gameScore = new GameScore({
      userId: req.user.id,
      gameType,
      score,
      details
    });

    await gameScore.save();

    // Get user's best score for this game type
    const bestScore = await GameScore.findOne({
      userId: req.user.id,
      gameType
    }).sort({ score: gameType === 'reaction' ? 1 : -1 }); // Lower is better for reaction time

    res.json({
      currentScore: gameScore,
      bestScore: bestScore?.score,
      isNewBest: bestScore?.id === gameScore.id
    });
  } catch (error) {
    console.error('Game score error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/scores/:gameType
// @desc    Get user's scores for a specific game
// @access  Private
router.get('/scores/:gameType', auth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;

    const scores = await GameScore.find({
      userId: req.user.id,
      gameType
    }).sort({ date: -1 }).limit(parseInt(limit));

    // Calculate statistics
    const stats = {
      totalGames: scores.length,
      bestScore: scores.length > 0 
        ? Math[gameType === 'reaction' ? 'min' : 'max'](...scores.map(s => s.score))
        : null,
      averageScore: scores.length > 0
        ? (scores.reduce((sum, score) => sum + score.score, 0) / scores.length).toFixed(1)
        : 0
    };

    res.json({
      scores,
      stats
    });
  } catch (error) {
    console.error('Get game scores error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/dashboard
// @desc    Get game statistics for dashboard
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const recentScores = await GameScore.find({
      userId: req.user.id,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ date: -1 });

    const stats = {
      totalGamesPlayed: recentScores.length,
      reactionTime: recentScores
        .filter(s => s.gameType === 'reaction')
        .slice(0, 1)[0]?.score || null,
      cognitiveScore: calculateCognitiveScore(recentScores)
    };

    res.json(stats);
  } catch (error) {
    console.error('Game dashboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate cognitive score
const calculateCognitiveScore = (scores) => {
  if (scores.length === 0) return 0;
  
  // Simple cognitive score based on recent performance
  const reactionScores = scores.filter(s => s.gameType === 'reaction').slice(0, 5);
  const hanoiScores = scores.filter(s => s.gameType === 'hanoi').slice(0, 5);
  
  let cognitiveScore = 50; // Base score
  
  // Factor in reaction time (lower is better)
  if (reactionScores.length > 0) {
    const avgReaction = reactionScores.reduce((sum, s) => sum + s.score, 0) / reactionScores.length;
    cognitiveScore += Math.max(0, (400 - avgReaction) / 10); // Better reaction time increases score
  }
  
  // Factor in problem-solving (fewer moves in Hanoi is better)
  if (hanoiScores.length > 0) {
    const avgMoves = hanoiScores.reduce((sum, s) => sum + (s.details?.moves || 0), 0) / hanoiScores.length;
    const optimalMoves = 7; // For 3-disk Hanoi
    cognitiveScore += Math.max(0, (optimalMoves - avgMoves + optimalMoves) * 2);
  }
  
  return Math.min(100, Math.round(cognitiveScore));
};

module.exports = router;