import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    if (!err.response) {
      return Promise.reject(new Error('Server unreachable. Make sure the backend is running on port 8000.'));
    }
    const message = err.response?.data?.detail || err.response?.data?.error || err.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export const weatherAPI = {
  get: (lat, lng) => api.get('/weather', { params: { latitude: lat, longitude: lng } }),
};

export const floodAPI = {
  getPrediction: (lat, lng) => api.get('/flood/prediction', { params: { latitude: lat, longitude: lng } }),
};

export const agentsAPI = {
  getStatus: () => api.get('/agents/status'),
};

export const sosAPI = {
  submit: (formData) => api.post('/sos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  }),
  getAll: () => api.get('/sos'),
};

export const recommendationsAPI = {
  send: (data) => api.post('/recommendations/send', data),
  getAll: () => api.get('/recommendations'),
};

export const missionReportAPI = {
  get: () => api.get('/mission-report'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const authAPI = {
  login: (email, password, role) =>
    api.post('/auth/login', { email, password, role }),

  register: (data) =>
    api.post('/auth/register', data),
};

export const geminiAPI = {
  getCivilAdvice:  (data) => api.post('/gemini/civil-advice',  data),
  getRescuePlan:   (data) => api.post('/gemini/rescue-plan',   data),
};

export const broadcastAPI = {
  sendAlert: (data) => api.post('/alerts/broadcast', data),
};

export const updatesAPI = {
  getAll: (limit = 50) => api.get('/updates', { params: { limit } }),
};

