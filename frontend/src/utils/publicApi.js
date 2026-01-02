import axios from 'axios';

// API Base URL Configuration
// In production (Vercel), VITE_API_URL must be set to the backend Vercel URL (e.g., https://your-backend.vercel.app/api)
// In local development, set VITE_API_URL=http://localhost:5000/api or it will default to /api
const getApiBaseUrl = () => {
  // Priority 1: Use VITE_API_URL if explicitly set (required for production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: In production, VITE_API_URL is required - throw error if missing
  if (import.meta.env.PROD) {
    console.error('❌ VITE_API_URL is required in production but not set!');
    console.error('Please set VITE_API_URL environment variable in Vercel project settings.');
    // Fallback to prevent complete failure, but this should not happen in production
    throw new Error('VITE_API_URL environment variable is required in production');
  }
  
  // Priority 3: Local development - default to relative path
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

export default api;

