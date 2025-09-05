// src/components/Features/Games.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Zap, Brain, Trophy, Play, RotateCcw, Target, Clock } from 'lucide-react';
import { api } from '../../services/api';
import './Features.css';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameStats, setGameStats] = useState({});
  const [loading, setLoading] = useState(false);

  const games = [
    {
      id: 'reaction',
      title: 'Reaction Time Test',
      description: 'Test your reflexes and reaction speed',
      icon: Zap,
      color: 'yellow',
      component: ReactionTimeGame
    },
    {
      id: 'hanoi',
      title: 'Tower of Hanoi',
      description: 'Classic puzzle to train problem-solving skills',
      icon: Brain,
      color: 'purple',
      component: HanoiTowerGame
    }
  ];

  useEffect(() => {
    fetchGameStats();
  }, []);

  const fetchGameStats = async () => {
    setLoading(true);
    try {
      const stats = await api.getGameDashboard();
      setGameStats(stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (gameType, score, details) => {
    try {
      await api.saveGameScore({ gameType, score, details });
      await fetchGameStats();
    } catch (error) {
      console.error('Error saving game score:', error);
    }
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="feature-container">
        <div className="game-header">
          <button
            onClick={() => setSelectedGame(null)}
            className="btn btn-secondary"
          >
            ← Back to Games
          </button>
          <h1 className="game-title">{selectedGame.title}</h1>
        </div>
        <GameComponent onGameComplete={handleGameComplete} />
      </div>
    );
  }

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div className="feature-title-section">
          <div className="feature-icon-wrapper feature-icon-purple">
            <Gamepad2 className="feature-icon" />
          </div>
          <div>
            <h1 className="feature-title">Brain Training Games</h1>
            <p className="feature-subtitle">
              Challenge your mind and improve cognitive abilities with fun games
            </p>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      {!loading && gameStats && (
        <div className="games-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <Trophy className="stat-icon" />
                <span className="stat-label">Games Played</span>
              </div>
              <div className="stat-value">{gameStats.totalGamesPlayed || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <Brain className="stat-icon" />
                <span className="stat-label">Cognitive Score</span>
              </div>
              <div className="stat-value">{gameStats.cognitiveScore || 0}/100</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <Zap className="stat-icon" />
                <span className="stat-label">Best Reaction</span>
              </div>
              <div className="stat-value">
                {gameStats.reactionTime ? `${gameStats.reactionTime}ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="games-grid">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <div key={game.id} className={`game-card game-card-${game.color}`}>
              <div className="game-card-header">
                <div className="game-icon">
                  <Icon />
                </div>
                <h3 className="game-title">{game.title}</h3>
              </div>
              <p className="game-description">{game.description}</p>
              <button
                onClick={() => setSelectedGame(game)}
                className="btn btn-primary game-play-btn"
              >
                <Play className="btn-icon" />
                Play Game
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Reaction Time Game Component
const ReactionTimeGame = ({ onGameComplete }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, green, measuring, result
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameState('ready');
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    timeoutRef.current = setTimeout(() => {
      setGameState('green');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      // Too early
      clearTimeout(timeoutRef.current);
      setGameState('waiting');
      alert('Too early! Wait for the green light.');
    } else if (gameState === 'green') {
      // Measure reaction time
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      setAttempts(prev => [...prev, reaction]);
      setGameState('result');
      
      // Save the score
      onGameComplete('reaction', reaction, { reactionTime: reaction });
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    clearTimeout(timeoutRef.current);
  };

  const getAverageTime = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, time) => sum + time, 0) / attempts.length);
  };

  return (
    <div className="reaction-game">
      <div className="game-instructions">
        <h3>Instructions</h3>
        <p>Click the circle as soon as it turns green. Don't click too early!</p>
      </div>

      <div 
        className={`reaction-circle ${gameState}`}
        onClick={handleClick}
      >
        {gameState === 'waiting' && (
          <div className="reaction-content">
            <Target className="reaction-icon" />
            <span>Click to Start</span>
          </div>
        )}
        {gameState === 'ready' && (
          <div className="reaction-content">
            <Clock className="reaction-icon" />
            <span>Wait for Green...</span>
          </div>
        )}
        {gameState === 'green' && (
          <div className="reaction-content">
            <Zap className="reaction-icon" />
            <span>CLICK NOW!</span>
          </div>
        )}
        {gameState === 'result' && (
          <div className="reaction-content">
            <Trophy className="reaction-icon" />
            <span>{reactionTime}ms</span>
          </div>
        )}
      </div>

      {gameState === 'result' && (
        <div className="reaction-results">
          <h3>Result: {reactionTime}ms</h3>
          <p>
            {reactionTime < 200 ? 'Excellent!' :
             reactionTime < 300 ? 'Good!' :
             reactionTime < 400 ? 'Average' : 'Keep practicing!'}
          </p>
        </div>
      )}

      <div className="reaction-stats">
        <div className="stat-item">
          <span className="stat-label">Attempts:</span>
          <span className="stat-value">{attempts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average:</span>
          <span className="stat-value">{getAverageTime()}ms</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best:</span>
          <span className="stat-value">
            {attempts.length > 0 ? Math.min(...attempts) : 0}ms
          </span>
        </div>
      </div>

      <div className="game-controls">
        <button onClick={startGame} className="btn btn-primary">
          Try Again
        </button>
        <button onClick={resetGame} className="btn btn-secondary">
          <RotateCcw className="btn-icon" />
          Reset
        </button>
      </div>
    </div>
  );
};

// Tower of Hanoi Game Component
const HanoiTowerGame = ({ onGameComplete }) => {
  const [towers, setTowers] = useState([
    [3, 2, 1], // Start with 3 disks on first tower
    [],
    []
  ]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const resetGame = () => {
    setTowers([[3, 2, 1], [], []]);
    setSelectedTower(null);
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  const handleTowerClick = (towerIndex) => {
    if (isComplete) return;

    if (selectedTower === null) {
      // Select a tower if it has disks
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      // Try to move disk
      if (selectedTower === towerIndex) {
        // Deselect
        setSelectedTower(null);
      } else {
        // Move disk if valid
        const fromTower = towers[selectedTower];
        const toTower = towers[towerIndex];
        const disk = fromTower[fromTower.length - 1];

        if (toTower.length === 0 || disk < toTower[toTower.length - 1]) {
          // Valid move
          const newTowers = [...towers];
          newTowers[selectedTower] = fromTower.slice(0, -1);
          newTowers[towerIndex] = [...toTower, disk];
          
          setTowers(newTowers);
          setMoves(m => m + 1);
          setSelectedTower(null);

          // Check if game is complete
          if (newTowers[2].length === 3) {
            setIsComplete(true);
            const timeElapsed = Date.now() - startTime;
            onGameComplete('hanoi', moves + 1, { 
              moves: moves + 1, 
              level: 3,
              time: timeElapsed
            });
          }
        } else {
          // Invalid move
          setSelectedTower(null);
        }
      }
    }
  };

  return (
    <div className="hanoi-game">
      <div className="game-instructions">
        <h3>Tower of Hanoi</h3>
        <p>Move all disks to the rightmost tower. Only smaller disks can go on top of larger ones.</p>
      </div>

      <div className="hanoi-stats">
        <div className="stat-item">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Target:</span>
          <span className="stat-value">7 moves</span>
        </div>
      </div>

      <div className="hanoi-towers">
        {towers.map((tower, towerIndex) => (
          <div
            key={towerIndex}
            className={`hanoi-tower ${selectedTower === towerIndex ? 'selected' : ''}`}
            onClick={() => handleTowerClick(towerIndex)}
          >
            <div className="tower-pole"></div>
            <div className="tower-base"></div>
            <div className="tower-disks">
              {tower.map((disk, diskIndex) => (
                <div
                  key={diskIndex}
                  className={`hanoi-disk disk-${disk}`}
                  style={{
                    bottom: `${diskIndex * 20 + 20}px`,
                    width: `${disk * 40 + 40}px`,
                    left: `calc(50% - ${(disk * 40 + 40) / 2}px)`
                  }}
                >
                  {disk}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="hanoi-complete">
          <h3>🎉 Congratulations!</h3>
          <p>You completed the puzzle in {moves} moves!</p>
          <p>
            {moves === 7 ? 'Perfect! You found the optimal solution!' :
             moves < 10 ? 'Excellent performance!' :
             moves < 15 ? 'Good job!' : 'Keep practicing!'}
          </p>
        </div>
      )}

      <div className="game-controls">
        <button onClick={resetGame} className="btn btn-primary">
          <RotateCcw className="btn-icon" />
          New Game
        </button>
      </div>
    </div>
  );
};

export default Games;