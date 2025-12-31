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
  Badge,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import { findIntent, getResponse } from '../../utils/chatbotIntents';
import QuickReply from './QuickReply';
import ChatForm from './ChatForm';
import TypingIndicator from './TypingIndicator';
import { format } from 'date-fns';
import { he } from 'date-fns/locale/he';
import { publicLeads } from '../../utils/publicApi';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        text: 'שלום! 👋 אני העוזר הדיגיטלי של TailorBiz.\n\nאני כאן לעזור לך עם:\n• מידע על התכונות\n• תמחור וחבילות\n• קביעת פגישת דמו\n• כל שאלה אחרת\n\nאיך אוכל לעזור?',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          { label: 'תכונות המערכת', value: 'features' },
          { label: 'תמחור', value: 'pricing' },
          { label: 'קבע דמו', value: 'demo' },
        ],
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [currentQuickReplies, setCurrentQuickReplies] = useState([
    { label: 'תכונות המערכת', value: 'features' },
    // { label: 'תמחור', value: 'pricing' },
    { label: 'קבע דמו', value: 'demo' },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const addMessage = (text, sender, quickReplies = []) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
      quickReplies: sender === 'bot' ? quickReplies : [],
    };
    setMessages((prev) => [...prev, newMessage]);
    if (sender === 'bot') {
      setCurrentQuickReplies(quickReplies);
    }
  };

  const handleSend = async (text = input, directIntent = null) => {
    if (!text.trim() && !directIntent) return;

    // אם יש intent ישיר, משתמשים בו; אחרת מחפשים לפי הטקסט
    const intentToUse = directIntent || findIntent(text);

    addMessage(text, 'user');
    setInput('');
    setIsTyping(true);
    setShowForm(false);

    setTimeout(() => {
      const response = getResponse(intentToUse);

      addMessage(response.text, 'bot', response.quickReplies);

      if (response.requiresForm) {
        setShowForm(true);
        setFormFields(response.formFields);
      }

      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (value, label) => {
    // בודק אם ה-value הוא intent name ישיר (קיים ב-intents)
    // אם כן, משתמש בו ישירות; אחרת שולח את ה-label בעברית ל-findIntent
    const validIntents = ['greeting', 'features', 'pricing', 'demo', 'crm', 'reminders',
      'scheduling', 'professional', 'human', 'thanks', 'bye', 'fallback'];

    if (validIntents.includes(value)) {
      // משתמש ב-intent ישיר עם הטקסט בעברית (ה-label) שיוצג למשתמש
      handleSend(label, value);
    } else {
      // שולח את ה-label בעברית ל-findIntent שיחפש את ה-intent המתאים
      handleSend(label || value);
    }
  };

  const handleFormSubmit = async (formData) => {
    setShowForm(false);
    addMessage(
      `פרטים שנשלחו:\n${Object.entries(formData)
        .map(([key, val]) => `• ${key}: ${val}`)
        .join('\n')}`,
      'user'
    );

    setIsTyping(true);
    try {
      await publicLeads.submit({
        name: formData?.name || '',
        email: formData?.email || '',
        phone: formData?.phone || '',
        company: formData?.company || '',
        message: formData?.message || '',
      });

      setTimeout(() => {
        addMessage(
          'תודה רבה!\n\nקיבלנו את הפרטים שלך.\nנציג יחזור אליך תוך 24 שעות.\n\nבינתיים, יש עוד משהו שאוכל לעזור בו?',
          'bot',
          [
            { label: 'לא, זה הכל', value: 'bye' },
            { label: 'כן, עוד שאלה', value: 'yes' },
          ]
        );
        setIsTyping(false);
      }, 900);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        'לא הצלחתי לשמור את הפרטים כרגע. אפשר לנסות שוב או להשאיר הודעה כאן בצ׳אט.';
      setTimeout(() => {
        addMessage(`מצטער, הייתה תקלה בשמירה: ${msg}`, 'bot', [
          { label: 'לנסות שוב', value: 'human' },
          { label: 'צור קשר', value: 'contact' },
        ]);
        setIsTyping(false);
      }, 900);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההיסטוריה?')) {
      setMessages([
        {
          id: 1,
          text: 'ההיסטוריה נמחקה. איך אוכל לעזור?',
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: [
            { label: 'תכונות המערכת', value: 'features' },
            { label: 'תמחור', value: 'pricing' },
            { label: 'קבע דמו', value: 'demo' },
          ],
        },
      ]);
      localStorage.removeItem('chatHistory');
    }
  };

  const downloadHistory = () => {
    const historyText = messages
      .map(
        (msg) =>
          `[${format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm', { locale: he })}] ${msg.sender === 'user' ? 'אתה' : 'TailorBiz'
          }: ${msg.text}`
      )
      .join('\n\n');

    const blob = new Blob([historyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tailorbiz-chat-${format(new Date(), 'dd-MM-yyyy')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Badge badgeContent={unreadCount} color="error">
        <Fab
          color="secondary"
          aria-label="פתח צ'אט"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
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
          <ChatIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Badge>

      <Drawer
        anchor="right"
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
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <SmartToyOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  TailorBiz Assistant
                </Typography>
                <Typography variant="caption">מקוון עכשיו 🟢</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="הורד היסטוריה">
                <IconButton onClick={downloadHistory} sx={{ color: 'white' }} size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="מחק היסטוריה">
                <IconButton onClick={clearHistory} sx={{ color: 'white' }} size="small">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'grey.50',
            }}
          >
            {messages.map((message) => (
              <Box key={message.id}>
                <Box
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
                      maxWidth: '80%',
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius:
                        message.sender === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                    >
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </Typography>
                  </Paper>
                </Box>

                {message.sender === 'bot' && message.quickReplies?.length > 0 && (
                  <Box sx={{ mb: 2, mr: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {message.quickReplies.map((reply, idx) => (
                        <Box
                          key={idx}
                          onClick={() => handleQuickReply(reply.value, reply.label)}
                          sx={{
                            px: 2,
                            py: 0.75,
                            bgcolor: 'white',
                            border: '1px solid',
                            borderColor: 'secondary.main',
                            borderRadius: 1,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'secondary.main',
                              color: 'white',
                            },
                          }}
                        >
                          {reply.label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <TypingIndicator />
              </Box>
            )}

            {showForm && (
              <ChatForm
                fields={formFields}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            )}

            <div ref={messagesEndRef} />
          </Box>

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
                disabled={showForm}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 6,
                  },
                }}
              />
              <IconButton
                color="secondary"
                onClick={() => handleSend()}
                disabled={!input.trim() || showForm}
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
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default ChatBot;
