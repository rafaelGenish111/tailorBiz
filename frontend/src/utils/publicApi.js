import axios from 'axios';

// Same base URL logic as admin API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

