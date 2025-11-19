import { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
            text: 'שלום! 👋 אני העוזר הדיגיטלי של TailorBiz. איך אוכל לעזור לך היום?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('תמחור') || lowerInput.includes('מחיר')) {
        botResponse = 'המערכת שלנו מציעה תשלום חד-פעמי ללא מנוי חודשי! המחיר משתנה לפי צרכי העסק. האם תרצה לקבוע שיחת ייעוץ חינם? 📞';
      } else if (lowerInput.includes('דמו') || lowerInput.includes('פגישה')) {
        botResponse = 'מעולה! אשמח לקבוע לך פגישת דמו. מה האימייל שלך? 📧';
      } else if (lowerInput.includes('תכונות') || lowerInput.includes('מה המערכת')) {
        botResponse = 'המערכת כוללת: CRM מותאם אישית, תזכורות אוטומטיות, ניהול תורים חכם, מעקב לקוחות, ניהול מלאי ואינטגרציות. על מה תרצה לשמוע יותר? 🎯';
      } else if (lowerInput.includes('@')) {
        botResponse = 'תודה! קיבלתי את כתובת המייל שלך. נציג יחזור אליך בהקדם האפשרי (בדרך כלל תוך 24 שעות). יש משהו נוסף שאוכל לעזור בו? 😊';
      } else {
        botResponse = 'תודה על הפנייה! האם תרצה לדבר על התמחור, לקבוע דמו או לשמוע על התכונות של המערכת? 💡';
      }

      const newBotMessage = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* כפתור פתיחה - ימין תחתון */}
      <Fab
        color="secondary"
        aria-label="פתח צ'אט"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,              // ✅ ימין תחתון
          width: 64,
          height: 64,
          boxShadow: '0px 8px 24px rgba(0,188,212,0.4)',
          zIndex: 1200,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <ChatIcon sx={{ fontSize: 32 }} aria-hidden="true" />
      </Fab>

      {/* Drawer - נפתח מימין */}
      <Drawer
        anchor="right"            // ✅ נפתח מימין
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            height: '100vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }} aria-hidden="true">
                <SmartToyOutlinedIcon />
              </Avatar>
              <Box>
                        <Typography variant="h6" fontWeight={700}>
                          TailorBiz Assistant
                        </Typography>
                <Typography variant="caption">תמיד כאן לעזור 🤖</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }} aria-label="סגור צ'אט">
              <CloseIcon aria-hidden="true" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'grey.50',
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '75%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} role="status" aria-live="polite" aria-label="הבוט כותב">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }} aria-hidden="true">
                  <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper elevation={1} sx={{ p: 2, borderRadius: '16px 16px 16px 4px' }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="הקלד הודעה..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 50,
                  },
                }}
              />
              <IconButton
                color="secondary"
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="שלח הודעה"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                  },
                }}
              >
                <SendIcon aria-hidden="true" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default ChatBot;
