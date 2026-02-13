import { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Fab,
  Fade,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import axios from 'axios';

/**
 * ChatWidget Component
 *
 * Widget צ'אט צף שמאפשר ללקוחות לשוחח עם הבוט AI
 * מוטמע בפינה התחתונה של המסך
 */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  const initializeChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/public/chat/init`, {});
      setSessionId(response.data.sessionId);

      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: response.data.welcomeMessage,
          timestamp: new Date()
        }
      ]);

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'מצטער, אירעה שגיאה באתחול הצ\'אט. אנא נסה שוב מאוחר יותר.',
          timestamp: new Date()
        }
      ]);
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    if (!isOpen && !isInitialized) {
      initializeChat();
    }
    setIsOpen(!isOpen);
  };

  // Send message to bot
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/public/chat/message`, {
        message: inputValue,
        sessionId: sessionId
      });

      // Add bot response to UI
      const botMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'מצטער, אירעה שגיאה בשליחת ההודעה. אנא נסה שוב.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 380,
            height: 600,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.dark' }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  BizFlow Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  מקוון • זמין 24/7
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={toggleChat}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#262626',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 1
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <BotIcon fontSize="small" />
                  </Avatar>
                )}

                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: '75%',
                    p: 1.5,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderBottomRightRadius: msg.role === 'user' ? 0 : 2,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 0 : 2
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    borderBottomLeftRadius: 0
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <CircularProgress size={8} />
                    <CircularProgress size={8} sx={{ animationDelay: '0.2s' }} />
                    <CircularProgress size={8} sx={{ animationDelay: '0.4s' }} />
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="הקלד הודעה..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'grey.300',
                    color: '#2626260'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block', textAlign: 'center' }}
            >
              מופעל על ידי AI • תגובות מהירות 24/7
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* Chat Button */}
      <Fab
        color="primary"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
};

export default ChatWidget;
