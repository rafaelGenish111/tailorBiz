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
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import { publicChat } from '../../utils/publicApi';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [botName, setBotName] = useState('Assistant');
  const [chatEnabled, setChatEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await publicChat.init();
      const data = response.data;

      if (!data.enabled) {
        setChatEnabled(false);
        return;
      }

      setSessionId(data.sessionId);
      setBotName(data.botName || 'Assistant');

      setMessages([
        {
          role: 'assistant',
          content: data.welcomeMessage,
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
      setIsInitialized(true);
    }
  };

  const toggleChat = () => {
    if (!isOpen && !isInitialized) {
      initializeChat();
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const msgText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await publicChat.sendMessage(sessionId, msgText);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      }]);

      if (response.data.conversationEnded) {
        setSessionId(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      if (error.response?.status === 404) {
        // Session expired, re-initialize
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'השיחה פגה. מתחיל שיחה חדשה...',
          timestamp: new Date()
        }]);
        setIsInitialized(false);
        setTimeout(() => initializeChat(), 1000);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'מצטער, אירעה שגיאה בשליחת ההודעה. אנא נסה שוב.',
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chatEnabled) return null;

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
            width: { xs: 'calc(100vw - 48px)', sm: 380 },
            height: { xs: 500, sm: 560 },
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 1300,
            bgcolor: '#1A1A1A',
            border: '1px solid #333333'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #00FF99 0%, #00E676 100%)',
              color: '#0A0A0A',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.15)', width: 40, height: 40 }}>
                <BotIcon sx={{ color: '#0A0A0A' }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0A0A0A' }}>
                  {botName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                  מקוון • זמין 24/7
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={toggleChat}
              sx={{ color: '#0A0A0A' }}
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
              bgcolor: '#1A1A1A',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#333333', borderRadius: 3 }
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
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#00FF99' }}>
                    <BotIcon sx={{ fontSize: 16, color: '#0A0A0A' }} />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: '78%',
                    p: 1.5,
                    bgcolor: msg.role === 'user' ? '#00FF99' : '#262626',
                    color: msg.role === 'user' ? '#0A0A0A' : '#FFFFFF',
                    borderRadius: '12px',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                    border: msg.role === 'assistant' ? '1px solid #333333' : 'none'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.6,
                      fontSize: '0.875rem'
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#00FF99' }}>
                  <BotIcon sx={{ fontSize: 16, color: '#0A0A0A' }} />
                </Avatar>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#262626',
                    borderRadius: '12px',
                    borderBottomLeftRadius: 4,
                    border: '1px solid #333333',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map(i => (
                      <Box
                        key={i}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#00FF99',
                          opacity: 0.4,
                          animation: 'chatDotPulse 1.4s infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes chatDotPulse': {
                            '0%, 80%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                            '40%': { opacity: 1, transform: 'scale(1.2)' }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider sx={{ borderColor: '#333333' }} />

          {/* Input */}
          <Box sx={{ p: 1.5, bgcolor: '#1A1A1A' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="הקלד הודעה..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !sessionId}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#262626',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#333333' },
                    '&:hover fieldset': { borderColor: '#00FF99' },
                    '&.Mui-focused fieldset': { borderColor: '#00FF99' },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#666666',
                    opacity: 1
                  }
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || !sessionId}
                aria-label="שלח הודעה"
                sx={{
                  bgcolor: '#00FF99',
                  color: '#0A0A0A',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#66FFB8'
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#333333',
                    color: '#666666'
                  }
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: '#666666', fontSize: '0.7rem' }}
            >
              מופעל על ידי AI
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* Chat FAB Button */}
      <Fab
        onClick={toggleChat}
        aria-label={isOpen ? 'סגור צ\'אט' : 'פתח צ\'אט'}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: '#00FF99',
          color: '#0A0A0A',
          width: 56,
          height: 56,
          boxShadow: '0 4px 20px rgba(0, 255, 153, 0.4)',
          '&:hover': {
            bgcolor: '#66FFB8',
            boxShadow: '0 6px 24px rgba(0, 255, 153, 0.5)'
          }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
};

export default ChatWidget;
