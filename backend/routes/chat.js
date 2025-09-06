const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/ChatHistory'); // Add this import
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Healthcare system prompt
const HEALTHCARE_SYSTEM_PROMPT = `
You are a Healthcare Q&A Assistant for HealthVerse, a mental wellness platform.
Your role is to provide reliable, evidence-based information about healthcare, wellness, nutrition, fitness, symptoms, diseases, and treatments.

Rules:
1. Answer ONLY healthcare-related questions including:
   - General health and wellness
   - Mental health and wellness
   - Nutrition and diet
   - Fitness and exercise
   - Symptoms and conditions
   - Preventive care
   - Stress management
   - Sleep health
   - Basic medical information

2. If the question is unrelated to healthcare (e.g., politics, movies, coding, entertainment, math, general conversation), politely refuse with:
   "I'm designed only for medical and healthcare-related questions. Please ask me something in that domain."

3. Do not provide specific medical diagnoses or prescribe treatments. Always include this disclaimer at the end of every healthcare response:
   "⚠️ This information is for educational purposes only. Please consult a medical professional for personal health advice."

4. FORMATTING REQUIREMENTS - Always format your responses with proper structure:
   - Start with a brief introduction to the topic
   - Use clear paragraph breaks (double line breaks) between sections
   - Use bullet points with • for listing items
   - Use numbered lists (1. 2. 3.) for step-by-step instructions
   - Use **bold text** for important terms, headings, or key points
   - Break long content into multiple short paragraphs (2-3 sentences each)
   - End with actionable advice or summary when appropriate
   - Never provide single paragraph responses - always use proper formatting

5. If the query is vague, ask a clarifying question before answering.
6. Be empathetic and supportive, especially for mental health queries.
7. Encourage healthy habits and positive lifestyle choices.

EXAMPLE FORMATTING:
**Topic Overview**
Brief introduction paragraph.

**Key Points:**
- First important point
- Second important point  
- Third important point

**Steps to Follow:**
1. First step with explanation
2. Second step with explanation
3. Third step with explanation

**Important Considerations:**
Additional paragraph with important notes.

Remember: You're part of a wellness platform, so maintain a caring and supportive tone while being informative and well-formatted.
`;

// Function to check if question is healthcare-related
const isHealthcareRelated = (question) => {
  const healthcareKeywords = [
    'health', 'medical', 'doctor', 'medicine', 'treatment', 'symptom', 'disease',
    'wellness', 'fitness', 'nutrition', 'diet', 'exercise', 'mental', 'stress',
    'anxiety', 'depression', 'sleep', 'pain', 'headache', 'fever', 'cold',
    'flu', 'vitamin', 'supplement', 'therapy', 'hospital', 'clinic', 'nurse',
    'medication', 'prescription', 'diagnosis', 'prevention', 'immune', 'vaccine',
    'heart', 'blood', 'pressure', 'diabetes', 'weight', 'BMI', 'calories',
    'protein', 'carbs', 'fat', 'sugar', 'cholesterol', 'meditation', 'yoga',
    'breathing', 'relaxation', 'mindfulness', 'mood', 'emotional', 'psychology',
    'psychiatric', 'counseling', 'recovery', 'addiction', 'smoking', 'alcohol'
  ];

  const questionLower = question.toLowerCase();
  return healthcareKeywords.some(keyword => questionLower.includes(keyword));
};

// POST /api/chat - Send message to chatbot
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [], userId } = req.body; // Add userId

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if the question is healthcare-related
    const isHealthcare = isHealthcareRelated(message);
    
    if (!isHealthcare) {
      const nonHealthcareResponse = "I'm designed only for medical and healthcare-related questions. Please ask me something in that domain.";
      
      // Save non-healthcare interaction if userId provided
      if (userId) {
        try {
          await ChatHistory.findOneAndUpdate(
            { userId },
            {
              $push: {
                conversations: {
                  message,
                  response: nonHealthcareResponse,
                  isHealthcareRelated: false
                }
              }
            },
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.error('Database error:', dbError);
        }
      }

      return res.json({
        response: nonHealthcareResponse,
        isHealthcareRelated: false
      });
    }

    // Get the generative model (free tier compatible)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation context
    let conversationContext = HEALTHCARE_SYSTEM_PROMPT + "\n\nConversation History:\n";
    
    // Add recent conversation history (last 5 exchanges to manage token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(exchange => {
      conversationContext += `User: ${exchange.message}\nAssistant: ${exchange.response}\n`;
    });

    conversationContext += `\nUser: ${message}\nAssistant: `;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const text = response.text();

    // Ensure disclaimer is included for healthcare responses
    let finalResponse = text;
    if (!text.includes("⚠️") && !text.includes("I'm designed only for medical")) {
      finalResponse += "\n\n⚠️ This information is for educational purposes only. Please consult a medical professional for personal health advice.";
    }

    // Save conversation to database if userId provided
    if (userId) {
      try {
        await ChatHistory.findOneAndUpdate(
          { userId },
          {
            $push: {
              conversations: {
                message,
                response: finalResponse,
                isHealthcareRelated: true
              }
            }
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Don't fail the response if database save fails
      }
    }

    res.json({
      response: finalResponse,
      isHealthcareRelated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: 'Failed to process your message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/chat/history/:userId - Get chat history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const chatHistory = await ChatHistory.findOne({ userId });
    
    if (!chatHistory) {
      return res.json({ conversations: [] });
    }

    res.json({ 
      conversations: chatHistory.conversations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve chat history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/chat/health - Health check for chat service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Chat service is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY 
  });
});

module.exports = router;