// src/components/Features/Chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import './Features.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. I can help you with medical questions, wellness advice, nutrition tips, and more. What would you like to know today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to format message text with proper line breaks and styling
  const formatMessageText = (text) => {
    if (!text) return text;
    
    return text
      // Convert **bold text** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert bullet points
      .replace(/• /g, '• ')
      // Convert numbered lists
      .replace(/(\d+\. )/g, '$1')
      // Convert line breaks to <br> tags
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        message: msg.text,
        response: msg.sender === 'bot' ? msg.text : ''
      })).filter(item => item.message);

      const response = await api.sendChatMessage(userMessage.text, conversationHistory);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        isHealthcareRelated: response.isHealthcareRelated
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError('Sorry, I encountered an error. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are the benefits of regular exercise?",
    "How can I improve my sleep quality?",
    "What foods boost immune system?",
    "How to manage stress and anxiety?",
    "Signs of dehydration to watch for",
    "Healthy habits for mental wellness"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div className="feature-title-section">
          <div className="feature-icon-wrapper feature-icon-blue">
            <Bot className="feature-icon" />
          </div>
          <div>
            <h1 className="feature-title">AI Health Assistant</h1>
            <p className="feature-subtitle">
              Get instant, reliable answers to your health and wellness questions
            </p>
          </div>
        </div>
      </div>

      <div className="chat-container">
        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? (
                  <User className="avatar-icon" />
                ) : (
                  <Bot className="avatar-icon" />
                )}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${message.isError ? 'message-error' : ''}`}>
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                  />
                  {message.isHealthcareRelated === false && message.sender === 'bot' && (
                    <div className="message-warning">
                      <AlertCircle className="warning-icon" />
                      <span>Non-healthcare question detected</span>
                    </div>
                  )}
                </div>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message message-bot">
              <div className="message-avatar">
                <Bot className="avatar-icon" />
              </div>
              <div className="message-content">
                <div className="message-bubble message-loading">
                  <Loader2 className="loading-icon" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="quick-questions">
            <h3 className="quick-questions-title">Quick Questions</h3>
            <div className="quick-questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-question-btn"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="chat-error">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about health and wellness..."
              className="chat-input"
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="chat-send-btn"
            >
              {isLoading ? (
                <Loader2 className="send-icon loading-spin" />
              ) : (
                <Send className="send-icon" />
              )}
            </button>
          </div>
          <div className="chat-input-info">
            <span className="input-info-text">
              Ask about symptoms, treatments, nutrition, fitness, mental health, and more
            </span>
            <span className="input-char-count">
              {inputMessage.length}/500
            </span>
          </div>
        </form>
      </div>

      {/* Disclaimer */}
      <div className="health-disclaimer">
        <AlertCircle className="disclaimer-icon" />
        <div className="disclaimer-content">
          <strong>Medical Disclaimer:</strong> This AI assistant provides general health information for educational purposes only. 
          Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.
        </div>
      </div>
    </div>
  );
};

export default Chatbot;