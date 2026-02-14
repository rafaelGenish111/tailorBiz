import axios from 'axios';

// API Base URL Configuration
// In production (Vercel), VITE_API_URL must be set to the backend Vercel URL (e.g., https://your-backend.vercel.app/api)
// In local development, set VITE_API_URL=http://localhost:5000/api or it will default to /api
const getApiBaseUrl = () => {
  // In production, VITE_API_URL is required
  if (import.meta.env.PROD) {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      console.error('❌ VITE_API_URL is required in production but not set!');
      throw new Error('VITE_API_URL environment variable is required in production');
    }
    return url;
  }
  // In development: use relative /api so Vite proxy forwards to backend (5001)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export const publicCMS = {
  getPage: (slug) => api.get(`/public/pages/${slug}`),
  getArticles: (params) => api.get('/public/articles', { params }),
  getArticle: (slug) => api.get(`/public/articles/${slug}`),
  getClients: () => api.get('/public/clients'),
  getClientsCount: () => api.get('/public/clients/count'),
  getTestimonials: () => api.get('/public/testimonials'),
  getSiteSettings: () => api.get('/public/site-settings')
};

export const publicLeads = {
  submit: (data) => api.post('/public/leads', data),
};

export const publicChat = {
  init: () => api.post('/public/chat/init', {}),
  sendMessage: (sessionId, message) => api.post('/public/chat/message', { sessionId, message }),
};

export default api;

