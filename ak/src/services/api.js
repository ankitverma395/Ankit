import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const youtubeAPI = {
  search: (q, maxResults = 20) => api.get(`/youtube/search?q=${encodeURIComponent(q)}&maxResults=${maxResults}`),
  trending: () => api.get('/youtube/trending'),
};

export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  addSong: (playlistId, song) => api.post(`/playlists/${playlistId}/songs`, { song }),
  removeSong: (playlistId, songId) => api.delete(`/playlists/${playlistId}/songs/${songId}`),
};

export const analyticsAPI = {
  track: (songId, durationListened) => api.post('/analytics/track', { songId, durationListened }),
  getStats: () => api.get('/analytics/stats'),
  getRecent: () => api.get('/analytics/recent'),
};

export const commentsAPI = {
  getBySong: (songId) => api.get(`/comments/song/${songId}`),
  create: (songId, text) => api.post('/comments', { songId, text }),
};

export default api;