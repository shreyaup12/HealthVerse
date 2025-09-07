const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware - UPDATED CORS
app.use(cors({
  origin: [
    'https://healthverse.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

app.use(express.json());

// Root route - ADDED THIS
app.get('/', (req, res) => {
  res.json({ 
    message: 'HealthVerse Backend API is running successfully!',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat', 
      mood: '/api/mood',
      games: '/api/games',
      meditation: '/api/meditation',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/games', require('./routes/games'));
app.use('/api/meditation', require('./routes/meditation'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'HealthVerse API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});