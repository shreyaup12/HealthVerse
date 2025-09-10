// src/components/Features/Meditation.js
import React, { useState, useEffect, useRef } from 'react';
import { Flower2, Play, Pause, Square, Clock, Target, Award } from 'lucide-react';
import { api } from '../../services/api';
import './Features.css';

const Meditation = () => {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(300); // in seconds
  const [selectedType, setSelectedType] = useState('breathing');
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedDuration, setCompletedDuration] = useState(0);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const meditationTypes = [
    { id: 'breathing', label: 'Breathing', description: 'Focus on your breath', emoji: '🌬️' },
    { id: 'mindfulness', label: 'Mindfulness', description: 'Present moment awareness', emoji: '🧘‍♀️' },
    { id: 'sleep', label: 'Sleep', description: 'Relaxation for better sleep', emoji: '😴' },
    { id: 'focus', label: 'Focus', description: 'Improve concentration', emoji: '🎯' }
  ];

  const durations = [5, 10, 15, 20, 30];

  useEffect(() => {
    fetchMeditationData();
  }, []);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const fetchMeditationData = async () => {
    setLoading(true);
    try {
      const data = await api.getMeditationSessions(30);
      setSessions(data.sessions || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching meditation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    startTimeRef.current = Date.now();
  };

  const handlePause = () => {
    setIsActive(false);
    if (startTimeRef.current) {
      const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setCompletedDuration(prev => prev + sessionTime);
      startTimeRef.current = Date.now();
    }
  };

  const handleStop = () => {
    setIsActive(false);
    if (startTimeRef.current) {
      const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalCompleted = completedDuration + sessionTime;
      saveSession(totalCompleted);
    }
    resetSession();
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    const totalCompleted = duration * 60; // Full duration completed
    saveSession(totalCompleted);
    resetSession();
  };

  const saveSession = async (completedSeconds) => {
    try {
      await api.saveMeditationSession({
        duration,
        type: selectedType,
        completedDuration: Math.round(completedSeconds / 60) // Convert to minutes
      });
      
      await fetchMeditationData();
    } catch (error) {
      console.error('Error saving meditation session:', error);
    }
  };

  const resetSession = () => {
    setTimeLeft(duration * 60);
    setCompletedDuration(0);
    startTimeRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = duration * 60;
    const elapsed = totalSeconds - timeLeft;
    return (elapsed / totalSeconds) * 100;
  };

  const getBreathingInstructions = () => {
    if (selectedType !== 'breathing') return null;
    
    const cycle = Math.floor((duration * 60 - timeLeft) / 8); // 8-second breathing cycle
    const phaseInCycle = (duration * 60 - timeLeft) % 8;
    
    if (phaseInCycle < 4) {
      return { phase: 'Breathe In', count: phaseInCycle + 1 };
    } else {
      return { phase: 'Breathe Out', count: phaseInCycle - 3 };
    }
  };

  const breathingInstructions = getBreathingInstructions();

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div className="feature-title-section">
          <div className="feature-icon-wrapper feature-icon-green">
            <Flower2 className="feature-icon" />
          </div>
          <div>
            <h1 className="feature-title">Meditation</h1>
            <p className="feature-subtitle">
              Find peace and mindfulness through guided meditation sessions
            </p>
          </div>
        </div>
      </div>

      <div className="meditation-content">
        {!isActive && timeLeft === duration * 60 && (
          <div className="meditation-setup">
            <div className="setup-section">
              <h3 className="setup-title">Choose Your Practice</h3>
              <div className="meditation-types">
                {meditationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`meditation-type-btn ${selectedType === type.id ? 'selected' : ''}`}
                  >
                    <span className="type-emoji">{type.emoji}</span>
                    <div className="type-content">
                      <span className="type-label">{type.label}</span>
                      <span className="type-description">{type.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <h3 className="setup-title">Duration</h3>
              <div className="duration-selector">
                {durations.map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={`duration-btn ${duration === dur ? 'selected' : ''}`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleStart} className="btn btn-primary meditation-start-btn">
              <Play className="btn-icon" />
              Start Meditation
            </button>
          </div>
        )}

        {(isActive || timeLeft < duration * 60) && (
          <div className="meditation-session">
            <div className="meditation-timer">
              <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--gray-200)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--primary-green)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    transform="rotate(-90 50 50)"
                    className="timer-progress"
                  />
                </svg>
                <div className="timer-content">
                  <div className="timer-time">{formatTime(timeLeft)}</div>
                  <div className="timer-type">{meditationTypes.find(t => t.id === selectedType)?.label}</div>
                </div>
              </div>
            </div>

            {selectedType === 'breathing' && isActive && breathingInstructions && (
              <div className="breathing-guide">
                <div className={`breathing-circle ${breathingInstructions.phase.toLowerCase().replace(' ', '-')}`}>
                  <div className="breathing-text">
                    <div className="breathing-phase">{breathingInstructions.phase}</div>
                    <div className="breathing-count">{breathingInstructions.count}</div>
                  </div>
                </div>
                <p className="breathing-instruction">
                  Follow the circle: breathe in for 4 counts, breathe out for 4 counts
                </p>
              </div>
            )}

            <div className="meditation-controls">
              <button onClick={handleStop} className="control-btn control-btn-stop">
                <Square className="control-icon" />
                Stop
              </button>
              
              <button
                onClick={isActive ? handlePause : handleStart}
                className="control-btn control-btn-play"
              >
                {isActive ? <Pause className="control-icon" /> : <Play className="control-icon" />}
                {isActive ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        )}

        {/* Meditation Stats */}
        {stats && !isActive && timeLeft === duration * 60 && (
          <div className="meditation-stats">
            <h3 className="stats-title">Your Progress</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <Target className="stat-icon" />
                  <span className="stat-label">Total Sessions</span>
                </div>
                <div className="stat-value">{stats.totalSessions || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <Clock className="stat-icon" />
                  <span className="stat-label">Total Minutes</span>
                </div>
                <div className="stat-value">{stats.totalMinutes || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <Award className="stat-icon" />
                  <span className="stat-label">Current Streak</span>
                </div>
                <div className="stat-value">{stats.streak || 0} days</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && !isActive && timeLeft === duration * 60 && (
          <div className="recent-sessions">
            <h3 className="sessions-title">Recent Sessions</h3>
            <div className="sessions-list">
              {sessions.slice(0, 5).map((session, index) => {
                const type = meditationTypes.find(t => t.id === session.type);
                return (
                  <div key={session._id || index} className="session-item">
                    <div className="session-icon">
                      {type?.emoji || '🧘‍♀️'}
                    </div>
                    <div className="session-info">
                      <div className="session-type">{type?.label || 'Meditation'}</div>
                      <div className="session-details">
                        {session.completedDuration}/{session.duration} min
                      </div>
                    </div>
                    <div className="session-date">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation;