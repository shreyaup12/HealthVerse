
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat-specific rate limiting (more restrictive)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: {
    error: 'Too many chat requests, please wait before sending another message.'
  }
});

// Apply rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply chat-specific rate limiting
app.use('/api/chat', chatLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/games', require('./routes/games'));
app.use('/api/meditation', require('./routes/meditation'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'HealthVerse API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected',
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 HealthVerse Backend Server Started
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔗 Health Check: http://localhost:${PORT}/api/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;

// scripts/seedData.js - Sample data seeding script
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const GameScore = require('../models/GameScore');
const MeditationSession = require('../models/MeditationSession');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await MoodEntry.deleteMany({});
    await GameScore.deleteMany({});
    await MeditationSession.deleteMany({});

    // Create sample user
    const user = new User({
      name: 'Demo User',
      email: 'demo@healthverse.com',
      password: 'demo123456',
      profile: {
        age: 28,
        gender: 'other'
      }
    });
    await user.save();

    console.log('Sample user created:', user.email);

    // Create sample mood entries
    const moodEntries = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      moodEntries.push({
        userId: user._id,
        mood: Math.floor(Math.random() * 7) + 3, // 3-10 range
        activities: ['exercise', 'meditation', 'reading'].slice(0, Math.floor(Math.random() * 3) + 1),
        journalEntry: `Day ${i + 1} reflection - feeling ${['great', 'good', 'okay', 'tired'][Math.floor(Math.random() * 4)]} today.`,
        date
      });
    }
    await MoodEntry.insertMany(moodEntries);
    console.log(`${moodEntries.length} mood entries created`);

    // Create sample game scores
    const gameScores = [];
    const gameTypes = ['reaction', 'hanoi'];
    
    for (let i = 0; i < 20; i++) {
      const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      let score, details;
      if (gameType === 'reaction') {
        score = Math.floor(Math.random() * 200) + 200; // 200-400ms
        details = { reactionTime: score };
      } else {
        score = Math.floor(Math.random() * 20) + 7; // 7-27 moves for Hanoi
        details = { moves: score, level: 3 };
      }
      
      gameScores.push({
        userId: user._id,
        gameType,
        score,
        details,
        date
      });
    }
    await GameScore.insertMany(gameScores);
    console.log(`${gameScores.length} game scores created`);

    // Create sample meditation sessions
    const sessions = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const duration = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
      const completedDuration = Math.max(1, duration - Math.floor(Math.random() * 3));
      
      sessions.push({
        userId: user._id,
        duration,
        completedDuration,
        type: ['breathing', 'mindfulness', 'sleep'][Math.floor(Math.random() * 3)],
        soundType: ['rain', 'forest', 'ocean', 'silence'][Math.floor(Math.random() * 4)],
        date
      });
    }
    await MeditationSession.insertMany(sessions);
    console.log(`${sessions.length} meditation sessions created`);

    console.log('\n🌱 Seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Email: demo@healthverse.com');
    console.log('Password: demo123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

