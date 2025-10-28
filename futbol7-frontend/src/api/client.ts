import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Player API
export const playerAPI = {
  getAll: (league: string) => apiClient.get('/players', { params: { league } }),
  create: (data: any) => apiClient.post('/players', data),
  update: (id: string, data: any) => apiClient.put(`/players/${id}`, data),
  delete: (id: string) => apiClient.delete(`/players/${id}`),
};

// Match API
export const matchAPI = {
  getAll: (league: string) => apiClient.get('/matches', { params: { league } }),
  getById: (id: string) => apiClient.get(`/matches/${id}`), // <-- NUEVA FUNCIÓN
  create: (data: any) => apiClient.post('/matches', data),
  update: (id: string, data: any) => apiClient.put(`/matches/${id}`, data),
  delete: (id: string) => apiClient.delete(`/matches/${id}`),
};