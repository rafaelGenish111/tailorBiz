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
  // In development: use relative /api so Vite proxy forwards to backend (avoids 404 and CORS)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

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

// ========== Auth (Admin) ==========
export const authAPI = {
  bootstrapNeeded: () => api.get('/auth/bootstrap-needed'),
  bootstrap: (data) => api.post('/auth/bootstrap', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

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

  // המרת ליד ללקוח
  convertLeadToClient: (id, data) => api.post(`/clients/${id}/convert`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

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

  // חוזה
  uploadContract: (id, data) =>
    api.post(`/clients/${id}/contract`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getContract: (id) => api.get(`/clients/${id}/contract`),

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
  getStatus: () => api.get('/whatsapp/status'),
  previewBulk: (params) => api.get('/whatsapp/bulk/preview', { params }),
  sendBulk: (data) => api.post('/whatsapp/bulk/send', data),
  restart: (resetSession = false) => api.post('/whatsapp/restart', { resetSession })
};

// ========== Tasks API ==========
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getTodayAgenda: () => api.get('/tasks/views/today-agenda'),
  getByDay: (date, projectId) =>
    api.get('/tasks/views/by-day', { params: { date, projectId } }),
  getCalendarView: (year, month) =>
    api.get('/tasks/views/calendar', { params: { year, month } }),
  getGanttView: (params) => api.get('/tasks/views/gantt', { params }),
  getStats: () => api.get('/tasks/stats/overview')
};

// ========== Projects API ==========
export const projectsAPI = {
  getByClient: (clientId) => api.get('/projects', { params: { clientId } }),
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addRequirement: (projectId, data) =>
    api.post(`/projects/${projectId}/requirements`, data),
  updateRequirement: (projectId, requirementId, data) =>
    api.put(`/projects/${projectId}/requirements/${requirementId}`, data),
  deleteRequirement: (projectId, requirementId) =>
    api.delete(`/projects/${projectId}/requirements/${requirementId}`)
};

// ========== Quotes API ==========
export const quotesAPI = {
  getByClient: (clientId) => api.get(`/quotes/client/${clientId}`),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (clientId, data) => api.post(`/quotes/client/${clientId}`, data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
  generateFromProject: (projectId, body) =>
    api.post(`/quotes/generate/${projectId}`, body || {}),
  generatePDF: (quoteId) => api.post(`/quotes/${quoteId}/generate-pdf`),
  uploadPDF: (quoteId, formData) =>
    api.post(`/quotes/${quoteId}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  duplicate: (quoteId) => api.post(`/quotes/${quoteId}/duplicate`),
  updateStatus: (quoteId, status) => api.put(`/quotes/${quoteId}/status`, { status })
};

// ========== Lead Nurturing API ==========
export const leadNurturingAPI = {
  getActiveInstances: (params) => api.get('/lead-nurturing/instances', { params })
};

// ========== Notifications API ==========
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// ========== CMS (Admin) ==========
export const adminPagesAPI = {
  list: () => api.get('/admin/pages'),
  getBySlug: (slug) => api.get(`/admin/pages/${slug}`),
  saveDraft: (slug, data) => api.put(`/admin/pages/${slug}/draft`, data),
  publish: (slug) => api.post(`/admin/pages/${slug}/publish`),
  unpublish: (slug) => api.post(`/admin/pages/${slug}/unpublish`),
  rollback: (slug, versionIndex) => api.post(`/admin/pages/${slug}/rollback/${versionIndex}`)
};

export const adminArticlesAPI = {
  list: (params) => api.get('/admin/articles', { params }),
  getById: (id) => api.get(`/admin/articles/${id}`),
  create: (data) => api.post('/admin/articles', data),
  update: (id, data) => api.put(`/admin/articles/${id}`, data),
  delete: (id) => api.delete(`/admin/articles/${id}`),
  publish: (id) => api.post(`/admin/articles/${id}/publish`),
  unpublish: (id) => api.post(`/admin/articles/${id}/unpublish`),
  rollback: (id, versionIndex) => api.post(`/admin/articles/${id}/rollback/${versionIndex}`)
};

export const adminSiteClientsAPI = {
  list: () => api.get('/admin/clients'),
  create: (data) => api.post('/admin/clients', data),
  update: (id, data) => api.put(`/admin/clients/${id}`, data),
  delete: (id) => api.delete(`/admin/clients/${id}`),
  reorder: (ids) => api.post('/admin/clients/reorder', { ids })
};

export const uploadsAPI = {
  getSignature: (folder) => api.get('/admin/uploads/signature', { params: { folder } }),
  uploadImage: (formData) =>
    api.post('/admin/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// ========== Site Settings (Admin) ==========
export const adminSiteSettingsAPI = {
  get: () => api.get('/admin/site-settings'),
  update: (data) => api.put('/admin/site-settings', data)
};

// ========== Employees / Users (Admin) ==========
export const adminUsersAPI = {
  list: () => api.get('/admin/users'),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  resetPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
};

export default api;
