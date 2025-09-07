const express = require('express');
const router = express.Router();

// Mock AI response function - replace with your actual AI service
const generateAIResponse = async (message, conversationHistory) => {
  // This is where you'd integrate with your AI service (OpenAI, etc.)
  // For now, returning a mock response
  
  const healthKeywords = [
    'health', 'medical', 'doctor', 'symptom', 'pain', 'medicine', 
    'nutrition', 'exercise', 'wellness', 'fitness', 'sleep', 'stress',
    'anxiety', 'depression', 'diet', 'vitamin', 'disease', 'treatment'
  ];
  
  const isHealthcareRelated = healthKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  // Mock responses based on content
  let response = '';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
    response = "Regular exercise offers numerous benefits including improved cardiovascular health, stronger muscles and bones, better mental health, and enhanced immune function. Aim for at least 150 minutes of moderate-intensity exercise per week, including both cardio and strength training.";
  } else if (lowerMessage.includes('sleep')) {
    response = "Good sleep hygiene is crucial for overall health. Try to maintain a consistent sleep schedule, create a relaxing bedtime routine, keep your bedroom cool and dark, limit screen time before bed, and avoid caffeine late in the day. Most adults need 7-9 hours of sleep per night.";
  } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
    response = "A balanced diet should include plenty of fruits and vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated, limit processed foods and added sugars, and consider portion sizes. Remember, sustainable dietary changes work better than extreme restrictions.";
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
    response = "Managing stress and anxiety can involve various techniques: regular exercise, deep breathing exercises, meditation, maintaining social connections, getting adequate sleep, and setting realistic goals. If symptoms persist or interfere with daily life, consider speaking with a mental health professional.";
  } else if (lowerMessage.includes('immune')) {
    response = "To support your immune system: eat a varied diet rich in fruits and vegetables, get adequate sleep, exercise regularly, manage stress, wash your hands frequently, stay hydrated, and consider getting recommended vaccinations. Vitamin D and C, along with zinc, may also support immune function.";
  } else if (isHealthcareRelated) {
    response = "I understand you have a health-related question. While I can provide general wellness information, it's important to consult with a qualified healthcare professional for personalized medical advice, especially for specific symptoms or conditions.";
  } else {
    response = "I'm designed to help with health and wellness questions. Could you please ask me something related to health, nutrition, fitness, mental wellness, or general medical information?";
  }
  
  return {
    response,
    isHealthcareRelated
  };
};

// POST /api/chat - Send a chat message
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }
    
    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty'
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({
        error: 'Message too long. Maximum 500 characters allowed.'
      });
    }
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, conversationHistory);
    
    // Log the interaction (for monitoring/debugging)
    console.log(`Chat - User: ${message.substring(0, 50)}...`);
    console.log(`Chat - Bot: ${aiResponse.response.substring(0, 50)}...`);
    
    res.json({
      success: true,
      response: aiResponse.response,
      isHealthcareRelated: aiResponse.isHealthcareRelated,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Sorry, I encountered an error processing your request.'
    });
  }
});

// GET /api/chat/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chat-api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;