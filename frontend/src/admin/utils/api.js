import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Testimonials API
export const testimonialsAPI = {
  getAll: (params) => api.get('/testimonials', { params }),
  getById: (id) => api.get(`/testimonials/${id}`),
  create: (data) => api.post('/testimonials', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/testimonials/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/testimonials/${id}`),
  updateStatus: (id, status) => api.patch(`/testimonials/${id}/status`, { status }),
  reorder: (testimonials) => api.patch('/testimonials/reorder', { testimonials }),
  getPublic: () => api.get('/testimonials/public')
};

// ========== Client API ==========
export const clientAPI = {
  // קבלת כל הלקוחות
  getAll: (params) => api.get('/clients', { params }),

  // קבלת לקוח בודד
  getById: (id) => api.get(`/clients/${id}`),

  // יצירת לקוח חדש
  create: (data) => api.post('/clients', data),

  // עדכון לקוח
  update: (id, data) => api.put(`/clients/${id}`, data),

  // מחיקת לקוח
  delete: (id) => api.delete(`/clients/${id}`),

  // שאלון אפיון
  fillAssessment: (id, data) => api.post(`/clients/${id}/assessment`, data),
  getAssessment: (id) => api.get(`/clients/${id}/assessment`),

  // אינטראקציות
  addInteraction: (id, data) => api.post(`/clients/${id}/interactions`, data),
  getInteractions: (id) => api.get(`/clients/${id}/interactions`),
  updateInteraction: (id, interactionId, data) => 
    api.put(`/clients/${id}/interactions/${interactionId}`, data),
  deleteInteraction: (id, interactionId) => 
    api.delete(`/clients/${id}/interactions/${interactionId}`),

  // הזמנות
  createOrder: (id, data) => api.post(`/clients/${id}/orders`, data),
  getOrders: (id) => api.get(`/clients/${id}/orders`),
  updateOrder: (id, orderId, data) => 
    api.put(`/clients/${id}/orders/${orderId}`, data),

  // תשלומים
  createPaymentPlan: (id, data) => api.post(`/clients/${id}/payment-plan`, data),
  updateInstallment: (id, installmentId, data) => 
    api.put(`/clients/${id}/payment-plan/installments/${installmentId}`, data),

  // חשבוניות
  createInvoice: (id, data) => api.post(`/clients/${id}/invoices`, data),
  getInvoices: (id) => api.get(`/clients/${id}/invoices`),

  // משימות
  createTask: (id, data) => api.post(`/clients/${id}/tasks`, data),
  getTasks: (id, params) => api.get(`/clients/${id}/tasks`, { params }),
  updateTask: (id, taskId, data) => 
    api.put(`/clients/${id}/tasks/${taskId}`, data),

  // סטטיסטיקות
  getOverviewStats: () => api.get('/clients/stats/overview'),
  getPipelineStats: () => api.get('/clients/stats/pipeline')
};

// ========== Invoice API ==========
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id, data) => api.post(`/invoices/${id}/send`, data),
  generatePDF: (id) => api.post(`/invoices/${id}/generate-pdf`),
  markAsPaid: (id, data) => api.post(`/invoices/${id}/mark-paid`, data),
  sendReminder: (id, data) => api.post(`/invoices/${id}/send-reminder`, data),
  getStats: () => api.get('/invoices/stats/overview')
};

// ========== WhatsApp API ==========
export const whatsappAPI = {
  sendMessage: (data) => api.post('/whatsapp/send-message', data),
  sendTemplate: (data) => api.post('/whatsapp/send-template', data),
  getConversations: () => api.get('/whatsapp/conversations'),
  getClientConversation: (clientId) => 
    api.get(`/whatsapp/conversations/${clientId}`),
  getStatus: () => api.get('/whatsapp/status')
};

// ========== Tasks API ==========
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getTodayAgenda: () => api.get('/tasks/views/today-agenda'),
  getCalendarView: (year, month) => api.get('/tasks/views/calendar', { params: { year, month } }),
  getStats: () => api.get('/tasks/stats/overview')
};

// ========== Notifications API ==========
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// ========== Auth API ==========
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export default api;

