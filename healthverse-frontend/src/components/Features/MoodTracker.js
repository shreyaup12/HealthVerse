// src/components/Features/MoodTracker.js
import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Save, Smile, Frown, Meh } from 'lucide-react';
import { api } from '../../services/api';
import './Features.css';

const MoodTracker = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const moodLabels = {
    1: { label: 'Terrible', emoji: '😢', color: '#dc2626' },
    2: { label: 'Bad', emoji: '😞', color: '#ea580c' },
    3: { label: 'Poor', emoji: '😕', color: '#d97706' },
    4: { label: 'Below Average', emoji: '😐', color: '#ca8a04' },
    5: { label: 'Neutral', emoji: '😊', color: '#65a30d' },
    6: { label: 'Good', emoji: '😊', color: '#16a34a' },
    7: { label: 'Great', emoji: '😄', color: '#059669' },
    8: { label: 'Very Good', emoji: '😁', color: '#0891b2' },
    9: { label: 'Excellent', emoji: '😍', color: '#0284c7' },
    10: { label: 'Amazing', emoji: '🤩', color: '#2563eb' }
  };

  const activities = [
    { id: 'exercise', label: 'Exercise', emoji: '🏃‍♂️' },
    { id: 'meditation', label: 'Meditation', emoji: '🧘‍♀️' },
    { id: 'reading', label: 'Reading', emoji: '📚' },
    { id: 'sleep', label: 'Good Sleep', emoji: '😴' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'social', label: 'Social Time', emoji: '👥' },
    { id: 'hobby', label: 'Hobbies', emoji: '🎨' },
    { id: 'outdoor', label: 'Outdoors', emoji: '🌳' }
  ];

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const data = await api.getMoodEntries(30);
      setMoodHistory(data.entries || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setMessage('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSaveMood = async () => {
    if (currentMood < 1 || currentMood > 10) {
      setMessage('Please select a valid mood rating');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await api.saveMoodEntry({
        mood: currentMood,
        activities: selectedActivities,
        journalEntry: journalEntry.trim()
      });

      setMessage('Mood entry saved successfully!');
      setJournalEntry('');
      setSelectedActivities([]);
      setCurrentMood(5);
      
      // Refresh data
      await fetchMoodData();
    } catch (error) {
      console.error('Error saving mood:', error);
      setMessage('Failed to save mood entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMoodIcon = (mood) => {
    if (mood <= 3) return <Frown className="mood-trend-icon negative" />;
    if (mood <= 7) return <Meh className="mood-trend-icon neutral" />;
    return <Smile className="mood-trend-icon positive" />;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="trend-icon positive" />;
      case 'declining':
        return <TrendingUp className="trend-icon negative" style={{ transform: 'rotate(180deg)' }} />;
      default:
        return <TrendingUp className="trend-icon neutral" style={{ transform: 'rotate(90deg)' }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="feature-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your mood data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div className="feature-title-section">
          <div className="feature-icon-wrapper feature-icon-pink">
            <Heart className="feature-icon" />
          </div>
          <div>
            <h1 className="feature-title">Mood Tracker</h1>
            <p className="feature-subtitle">
              Track your daily mood and discover patterns in your emotional wellbeing
            </p>
          </div>
        </div>
      </div>

      <div className="mood-tracker-content">
        {/* Current Mood Entry */}
        <div className="mood-entry-section">
          <div className="mood-entry-card">
            <h2 className="mood-entry-title">How are you feeling today?</h2>
            
            {/* Mood Scale */}
            <div className="mood-scale">
              <div className="mood-scale-header">
                <span className="mood-scale-label">Mood Rating</span>
                <div className="mood-current">
                  <span className="mood-emoji">{moodLabels[currentMood].emoji}</span>
                  <span className="mood-label">{moodLabels[currentMood].label}</span>
                  <span className="mood-value">{currentMood}/10</span>
                </div>
              </div>
              
              <div className="mood-slider-container">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                  className="mood-slider"
                  style={{ 
                    background: `linear-gradient(to right, #dc2626 0%, ${moodLabels[currentMood].color} ${((currentMood - 1) / 9) * 100}%, #e5e7eb ${((currentMood - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="mood-scale-labels">
                  <span>Terrible</span>
                  <span>Amazing</span>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="mood-activities">
              <h3 className="activities-title">What influenced your mood today?</h3>
              <div className="activities-grid">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityToggle(activity.id)}
                    className={`activity-btn ${selectedActivities.includes(activity.id) ? 'activity-btn-selected' : ''}`}
                  >
                    <span className="activity-emoji">{activity.emoji}</span>
                    <span className="activity-label">{activity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div className="mood-journal">
              <h3 className="journal-title">Journal Entry (Optional)</h3>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="How was your day? What are you grateful for? Any thoughts or reflections..."
                className="journal-textarea"
                maxLength={1000}
                rows={4}
              />
              <div className="journal-char-count">
                {journalEntry.length}/1000
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveMood}
              disabled={saving}
              className="btn btn-primary mood-save-btn"
            >
              <Save className="btn-icon" />
              {saving ? 'Saving...' : 'Save Mood Entry'}
            </button>

            {message && (
              <div className={`mood-message ${message.includes('success') ? 'mood-message-success' : 'mood-message-error'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Mood Statistics */}
        {stats && (
          <div className="mood-stats-section">
            <h2 className="section-title">Your Mood Insights</h2>
            <div className="mood-stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <Calendar className="stat-icon" />
                  <span className="stat-label">Total Entries</span>
                </div>
                <div className="stat-value">{stats.totalEntries || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  {getMoodIcon(parseFloat(stats.averageMood) || 5)}
                  <span className="stat-label">Average Mood</span>
                </div>
                <div className="stat-value">{stats.averageMood || 'N/A'}/10</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  {getTrendIcon(stats.moodTrend)}
                  <span className="stat-label">Trend</span>
                </div>
                <div className="stat-value capitalize">{stats.moodTrend || 'Neutral'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Mood History */}
        {moodHistory.length > 0 && (
          <div className="mood-history-section">
            <h2 className="section-title">Recent Entries</h2>
            <div className="mood-history">
              {moodHistory.slice(0, 7).map((entry) => (
                <div key={entry._id} className="mood-history-item">
                  <div className="mood-history-date">
                    <Calendar className="date-icon" />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                  <div className="mood-history-mood">
                    <span className="mood-emoji">{moodLabels[entry.mood].emoji}</span>
                    <span className="mood-value">{entry.mood}/10</span>
                  </div>
                  <div className="mood-history-activities">
                    {entry.activities?.slice(0, 3).map((activityId) => {
                      const activity = activities.find(a => a.id === activityId);
                      return activity ? (
                        <span key={activityId} className="activity-tag">
                          {activity.emoji} {activity.label}
                        </span>
                      ) : null;
                    })}
                    {entry.activities?.length > 3 && (
                      <span className="activity-more">+{entry.activities.length - 3}</span>
                    )}
                  </div>
                  {entry.journalEntry && (
                    <div className="mood-history-journal">
                      <p>"{entry.journalEntry.substring(0, 100)}{entry.journalEntry.length > 100 ? '...' : ''}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;