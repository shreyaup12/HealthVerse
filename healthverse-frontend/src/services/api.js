
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthverse.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'x-auth-token': token }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: data, 
      ...options 
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: data, 
      ...options 
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Mood API
  async saveMoodEntry(moodData) {
    return this.post('/mood', moodData);
  }

  async getMoodEntries(days = 30) {
    return this.get(`/mood?days=${days}`);
  }

  // Games API
  async saveGameScore(gameData) {
    return this.post('/games/score', gameData);
  }

  async getGameScores(gameType, limit = 10) {
    return this.get(`/games/scores/${gameType}?limit=${limit}`);
  }

  async getGameDashboard() {
    return this.get('/games/dashboard');
  }

  // Meditation API
  async saveMeditationSession(sessionData) {
    return this.post('/meditation/session', sessionData);
  }

  async getMeditationSessions(days = 30, limit = 20) {
    return this.get(`/meditation/sessions?days=${days}&limit=${limit}`);
  }

  // Chat API
  async sendChatMessage(message, conversationHistory = []) {
    return this.post('/chat', { message, conversationHistory });
  }

  async getChatHealth() {
    return this.get('/chat/health');
  }
}

export const api = new ApiService();