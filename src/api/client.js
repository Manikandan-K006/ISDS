import axios from 'axios';
import { API_BASE } from '../utils/constants';

const API = axios.create({ baseURL: `${API_BASE}/api` });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('isds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('isds_token');
      localStorage.removeItem('isds_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
