import axios from 'axios';
import { API_BASE } from '../utils/constants';

const API = axios.create({ baseURL: `${API_BASE}/api` });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sidts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
      const refreshToken = localStorage.getItem('sidts_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh-token`, { refreshToken });
          localStorage.setItem('sidts_token', data.token);
          localStorage.setItem('sidts_refresh_token', data.refreshToken);
          localStorage.setItem('sidts_user', JSON.stringify(data.user));
          err.config.headers.Authorization = `Bearer ${data.token}`;
          return axios(err.config);
        } catch {
          localStorage.removeItem('sidts_token');
          localStorage.removeItem('sidts_refresh_token');
          localStorage.removeItem('sidts_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('sidts_token');
        localStorage.removeItem('sidts_user');
        window.location.href = '/login';
      }
    } else if (err.response?.status === 401) {
      localStorage.removeItem('sidts_token');
      localStorage.removeItem('sidts_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;