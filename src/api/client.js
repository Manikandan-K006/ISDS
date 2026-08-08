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
          window.location.href = '/auth';
        }
      } else {
        localStorage.removeItem('sidts_token');
        localStorage.removeItem('sidts_user');
        window.location.href = '/auth';
      }
    } else if (err.response?.status === 401) {
      const hadSession = !!localStorage.getItem('sidts_token');
      const isLoginRequest = err.config?.url?.includes('/auth/login');
      if (hadSession && !isLoginRequest) {
        localStorage.removeItem('sidts_token');
        localStorage.removeItem('sidts_user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err?.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  const data = err.response.data;
  if (data && typeof data.error === 'string' && data.error) {
    return data.error;
  }
  const contentType = err.response.headers?.['content-type'] || '';
  if (!contentType.includes('application/json') && typeof data === 'string') {
    return 'The server returned an unexpected response. The API may be unreachable or misconfigured.';
  }
  if (err.response.status === 401) {
    return 'Invalid email or password.';
  }
  if (err.response.status === 403) {
    return 'You are not authorized to perform this action.';
  }
  if (err.response.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return fallback;
};

export default API;