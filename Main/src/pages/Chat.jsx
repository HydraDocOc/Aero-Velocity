import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Gemini REST setup (using gemini-1.5-flash)
  const systemPrompt = `You are an intelligent Formula 1 AI Engineer named AERO, part of the AeroVelocity project. You answer questions about F1 aerodynamics, car performance, strategy, and AI optimization in a technical yet conversational tone. You give actionable, real engineering insights (like downforce analysis, drag reduction, efficiency tips) while keeping the vibe futuristic and Formula 1-themed. Use slight personality — confident, analytical, and precise like a real F1 data engineer.`;
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText = null) => {
    const message = messageText || input.trim();
    if (!message) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    // Create a placeholder AI message to animate typing into
    const placeholderId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      {
        id: placeholderId,
        text: '',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        alert('Gemini API key missing. Add VITE_GEMINI_API_KEY in .env and restart dev server.');
        updateMessageText(placeholderId, 'Gemini API key missing.');
        setMessages(prev => prev.map(m => (m.id === placeholderId ? { ...m, isError: true } : m)));
        return;
      }

      // Build chat history to maintain context
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!resp.ok) {
        const errText = resp.status === 403 || resp.status === 404
          ? 'Model not accessible. Try switching to gemini-1.5-flash.'
          : `Request failed (${resp.status}). Please try again.`;
        updateMessageText(placeholderId, errText);
        setMessages(prev => prev.map(m => (m.id === placeholderId ? { ...m, isError: true } : m)));
        return;
      }
      const data = await resp.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      await typeOutMessage(placeholderId, reply);
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      const msg = String(error?.message || error);
      const hint = !import.meta.env.VITE_GEMINI_API_KEY
        ? 'Gemini API key missing. Add VITE_GEMINI_API_KEY in .env and restart dev server.'
        : (msg.includes('404') || msg.includes('not found'))
          ? 'Selected model is not available for this key. Enable access or switch to gemini-1.5-flash.'
          : 'Something went wrong, try again';
      updateMessageText(placeholderId, hint);
      setMessages(prev => prev.map(m => (m.id === placeholderId ? { ...m, isError: true } : m)));
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageText = (id, text) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
  };

  const typeOutMessage = (id, fullText) => {
    return new Promise((resolve) => {
      const chars = Array.from(fullText);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        updateMessageText(id, chars.slice(0, i).join(''));
        if (i >= chars.length) {
          clearInterval(interval);
          resolve();
        }
      }, 12);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="chat-page">
      {/* Background Effects */}
      <div className="chat-background">
        <div className="chat-grid-overlay" />
        <div className="chat-glow-effects" />
      </div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="chat-container"
      >
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="ai-icon">
              <Bot size={28} />
            </div>
            <div className="header-text">
              <h1 className="chat-title">AI Chat Engineer</h1>
              <span className="chat-status">● Online</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="close-btn" onClick={handleClear} title="Clear conversation">
              <MessageSquare size={18} />
            </button>
            <button className="close-btn" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="empty-state"
              >
                <motion.div 
                  className="ai-avatar"
                  animate={{ 
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 0 30px rgba(255, 0, 64, 0.4)",
                      "0 0 40px rgba(255, 0, 64, 0.6)",
                      "0 0 30px rgba(255, 0, 64, 0.4)"
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Bot size={60} />
                </motion.div>
                <h3 className="empty-title">Start a conversation</h3>
                <p className="empty-text">Ask me anything about F1, aerodynamics, or AI optimization!</p>
                <div className="suggestions">
                  <span 
                    className="suggestion-tag" 
                    onClick={() => handleSend("Tell me about aerodynamics in Formula 1")}
                  >
                    Aerodynamics
                  </span>
                  <span 
                    className="suggestion-tag" 
                    onClick={() => handleSend("How can I improve car performance?")}
                  >
                    Performance
                  </span>
                  <span 
                    className="suggestion-tag" 
                    onClick={() => handleSend("What's the best F1 strategy for race day?")}
                  >
                    Strategy
                  </span>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`message-wrapper ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-content">
                    <div className="message-avatar">
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                      <p className="message-text">{msg.text}</p>
                      <span className="message-timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message-wrapper ai-message"
            >
              <div className="message-content">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble loading">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="loading-text">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about aerodynamics, F1 strategy, or performance..."
              className="message-input"
            />
            <button
              onClick={handleSend}
              className={`send-btn ${!input.trim() || isLoading ? 'disabled' : ''}`}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  // ✅ Background image version of container
  container: {
    width: '100vw',
    height: '100vh',
    backgroundImage: 'url("/assets/chat-bg.jpg")', // ✅ Path to your image (put in /public/assets/)
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
  },

  // ✅ Dark overlay (optional, helps make text visible)
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 0,
  },

  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    zIndex: 999,
  },
  chatContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(0.8)',
    width: '600px',
    height: '700px',
    zIndex: 1000,
    opacity: 0,
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  chatOpen: {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
  },
  chatGlass: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 0, 80, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '30px',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
  },
  headerLeft: { display: 'flex', gap: '15px', alignItems: 'center' },
  headerText: { display: 'flex', flexDirection: 'column' },
  chatTitle: { color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: '600' },
  chatStatus: { color: '#00ff88', fontSize: '12px' },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
  },
  messagesContainer: {
    flex: 1,
    padding: '25px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#ffffff',
  },
  aiAvatar: { fontSize: '60px', marginBottom: '20px' },
  emptyTitle: { fontSize: '24px', margin: '10px 0' },
  emptyText: { color: '#b0b0b0', fontSize: '16px' },
  userMessageWrapper: { display: 'flex', justifyContent: 'flex-end' },
  aiMessageWrapper: { display: 'flex', justifyContent: 'flex-start' },
  userMessage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    padding: '12px 18px',
    borderRadius: '20px 20px 5px 20px',
    maxWidth: '70%',
    boxShadow: '0 0 20px rgba(118, 75, 162, 0.5)',
  },
  aiMessage: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '12px 18px',
    borderRadius: '20px 20px 20px 5px',
    maxWidth: '70%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
  },
  timestamp: {
    fontSize: '10px',
    opacity: 0.7,
    marginTop: '5px',
    display: 'block',
  },
  loadingIcon: { animation: 'spin 1s linear infinite' },
  inputContainer: {
    display: 'flex',
    gap: '15px',
    padding: '25px 30px',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  input: {
    flex: 1,
    padding: '15px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '25px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#000000',
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.6)',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Chat;
