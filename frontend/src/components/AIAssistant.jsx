import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// import axios from 'axios';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your BachatSaathi AI Assistant. How can I help you with your finances today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { token, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Show a typing indicator
      const typingMessage = {
        role: 'assistant',
        content: '...',
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      const response = await api.post(
        '/insights/assistant/chat',
        { message },
        { timeout: 30000 } // 30 seconds timeout
      );

      // Remove the typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      if (response.data?.data?.response) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.data?.error?.code === 'API_QUOTA_EXCEEDED') {
        const errorMessage = {
          role: 'assistant',
          content: 'API quota exceeded. Please try again later.',
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        throw new Error('No response from AI Assistant');
      }
    } catch (error) {
      console.error('AI Assistant Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      // Remove the typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.message || 
                'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      style={{
        filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))',
        animation: 'float 3s ease-in-out infinite'
      }}
    >
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Hi, {user?.name || 'there'}! 👋</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-indigo-100 dark:bg-indigo-900/80' 
                        : 'bg-white dark:bg-gray-800/90'
                    } rounded-2xl px-4 py-2 shadow-sm border ${
                      msg.role === 'user' 
                        ? 'border-indigo-200 dark:border-indigo-800' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {msg.role === 'assistant' && !msg.isTyping && (
                      <div className="mr-2 mt-0.5 flex-shrink-0">
                        <Bot className="h-5 w-5 text-indigo-500" />
                      </div>
                    )}
                    <div className={`text-sm ${msg.isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {msg.isTyping ? (
                        <div className="flex space-x-1 py-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className={msg.isError ? 'flex items-start' : ''}>
                          {msg.isError && <span className="mr-1">⚠️</span>}
                          <span>{msg.content}</span>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="ml-2 mt-0.5 flex-shrink-0">
                        <User className="h-5 w-5 text-indigo-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me about your finances..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              BachatSaathi AI can help analyze your spending, suggest budgets, and more.
            </p>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ring-2 ring-white/50 dark:ring-gray-900/50 relative overflow-hidden group"
          aria-label="Open AI Assistant"
          style={{
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.5)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
