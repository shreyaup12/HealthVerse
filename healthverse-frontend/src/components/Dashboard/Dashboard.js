// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  MessageCircle,
  Heart,
  Gamepad2,
  Flower2,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Activity,
  Brain,
  Smile,
  Target
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    moodStats: null,
    gameStats: null,
    meditationStats: null,
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [moodData, gameData, meditationData] = await Promise.all([
        api.getMoodEntries(7).catch(() => ({ stats: null })),
        api.getGameDashboard().catch(() => null),
        api.getMeditationSessions(7).catch(() => ({ stats: null }))
      ]);

      setDashboardData({
        moodStats: moodData.stats,
        gameStats: gameData,
        meditationStats: meditationData.stats,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'AI Health Chat',
      description: 'Get instant health insights',
      icon: MessageCircle,
      link: '/chatbot',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Mood Check-in',
      description: 'Track your daily mood',
      icon: Heart,
      link: '/mood',
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Brain Games',
      description: 'Train your cognitive skills',
      icon: Gamepad2,
      link: '/games',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Meditation',
      description: 'Find your inner peace',
      icon: Flower2,
      link: '/meditation',
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  const { moodStats, gameStats, meditationStats, loading } = dashboardData;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getTimeOfDayGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Ready to continue your wellness journey today?
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar className="date-icon" />
          <span>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className={`quick-action-card quick-action-${action.color}`}
              >
                <div className="quick-action-icon">
                  <Icon />
                </div>
                <div className="quick-action-content">
                  <h3 className="quick-action-title">{action.title}</h3>
                  <p className="quick-action-description">{action.description}</p>
                </div>
                <div className="quick-action-arrow">→</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <h2 className="section-title">This Week's Overview</h2>
        <div className="stats-grid">
          {/* Mood Stats */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon stat-icon-mood">
                <Smile />
              </div>
              <div className="stat-info">
                <h3 className="stat-title">Mood Tracking</h3>
                <p className="stat-subtitle">Average mood this week</p>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {moodStats?.averageMood ? `${moodStats.averageMood}/10` : 'No data'}
              </div>
              <div className="stat-label">
                <TrendingUp className="trend-icon" />
                {moodStats?.moodTrend === 'improving' && 'Trending up'}
                {moodStats?.moodTrend === 'declining' && 'Needs attention'}
                {moodStats?.moodTrend === 'stable' && 'Staying stable'}
                {!moodStats?.moodTrend && 'Start tracking'}
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon stat-icon-games">
                <Brain />
              </div>
              <div className="stat-info">
                <h3 className="stat-title">Brain Training</h3>
                <p className="stat-subtitle">Games played this week</p>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {gameStats?.totalGamesPlayed || 0}
              </div>
              <div className="stat-label">
                <Award className="trend-icon" />
                Cognitive Score: {gameStats?.cognitiveScore || 0}/100
              </div>
            </div>
          </div>

          {/* Meditation Stats */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon stat-icon-meditation">
                <Activity />
              </div>
              <div className="stat-info">
                <h3 className="stat-title">Meditation</h3>
                <p className="stat-subtitle">Minutes meditated this week</p>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {meditationStats?.totalMinutes || 0}m
              </div>
              <div className="stat-label">
                <Target className="trend-icon" />
                {meditationStats?.streak || 0} day streak
              </div>
            </div>
          </div>

          {/* Overall Wellness */}
          <div className="stat-card stat-card-featured">
            <div className="stat-header">
              <div className="stat-icon stat-icon-wellness">
                <Heart />
              </div>
              <div className="stat-info">
                <h3 className="stat-title">Wellness Score</h3>
                <p className="stat-subtitle">Overall health index</p>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {calculateWellnessScore(moodStats, gameStats, meditationStats)}/100
              </div>
              <div className="stat-label">
                <Clock className="trend-icon" />
                Keep up the great work!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Recommendations */}
      <div className="recommendations">
        <h2 className="section-title">Today's Recommendations</h2>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="recommendation-icon">💡</div>
            <div className="recommendation-content">
              <h4>Take a mood check-in</h4>
              <p>Track how you're feeling today to build healthy habits.</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">🧠</div>
            <div className="recommendation-content">
              <h4>Play a brain game</h4>
              <p>Spend 5 minutes training your cognitive abilities.</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="recommendation-icon">🧘</div>
            <div className="recommendation-content">
              <h4>Try meditation</h4>
              <p>Start with a 5-minute breathing exercise to center yourself.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate overall wellness score
const calculateWellnessScore = (moodStats, gameStats, meditationStats) => {
  let score = 0;
  let factors = 0;

  // Mood factor (40% weight)
  if (moodStats?.averageMood) {
    score += (parseFloat(moodStats.averageMood) / 10) * 40;
    factors++;
  }

  // Games factor (30% weight)
  if (gameStats?.cognitiveScore) {
    score += (gameStats.cognitiveScore / 100) * 30;
    factors++;
  }

  // Meditation factor (30% weight)
  if (meditationStats?.totalMinutes) {
    const meditationScore = Math.min(meditationStats.totalMinutes / 60, 1); // Max 60 minutes per week for full score
    score += meditationScore * 30;
    factors++;
  }

  // If no data, return 0
  if (factors === 0) return 0;

  return Math.round(score);
};

export default Dashboard;