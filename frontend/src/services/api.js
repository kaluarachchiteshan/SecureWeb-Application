import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('secureweb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper API Endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  getProfile: () => API.get('/auth/profile'),
  generateApiKey: () => API.post('/auth/api-key'),
  revokeApiKey: () => API.delete('/auth/api-key'),
};

export const websiteAPI = {
  getWebsites: (params) => API.get('/websites', { params }),
  getWebsiteById: (id) => API.get(`/websites/${id}`),
  addWebsite: (data) => API.post('/websites', data),
  updateWebsite: (id, data) => API.put(`/websites/${id}`, data),
  deleteWebsite: (id) => API.delete(`/websites/${id}`),
  getBadgeUrl: (id) => `/api/websites/${id}/badge.svg`,
};

export const scanAPI = {
  triggerScan: (data) => API.post('/scans/run', data),
  getMetrics: () => API.get('/scans/metrics'),
  getScanHistory: (websiteId) => API.get(`/scans/history/${websiteId}`),
  getLatestScan: (websiteId) => API.get(`/scans/latest/${websiteId}`),
};

export const alertAPI = {
  getAlerts: (params) => API.get('/alerts', { params }),
  updateStatus: (id, status) => API.put(`/alerts/${id}/status`, { status }),
  deleteAlert: (id) => API.delete(`/alerts/${id}`),
};

export const reportAPI = {
  getPdfUrl: (websiteId) => `/api/reports/pdf/${websiteId}`,
  getCsvUrl: (websiteId) => `/api/reports/csv/${websiteId}`,
};

export const knowledgeAPI = {
  getItems: (params) => API.get('/knowledge', { params }),
  getByTopicId: (topicId) => API.get(`/knowledge/${topicId}`),
};

export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: () => API.get('/admin/users'),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getWebsites: () => API.get('/admin/websites'),
};

export default API;
