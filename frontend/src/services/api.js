import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kross_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kross_token');
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
};

export const ticketsApi = {
  list:   (params) => api.get('/tickets', { params }),
  getOne: (id)     => api.get(`/tickets/${id}`),
  create: (data)   => api.post('/tickets', data),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
};

export const commentsApi = {
  list: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
};

export const historyApi = {
  list: (ticketId) => api.get(`/tickets/${ticketId}/history`),
};

export default api;
