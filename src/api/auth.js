import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/auth` });

export const login = (data) => api.post('/login', data).then(r => r.data);
export const register = (data) => api.post('/register', data).then(r => r.data);
export const forgotPassword = (data) => api.post('/forgot-password', data).then(r => r.data);
export const resetPassword = (data) => api.post('/reset-password', data).then(r => r.data);
export const refreshToken = () => api.post('/refresh-token').then(r => r.data);
export const googleLogin = (credential) => api.post('/google', { credential }).then(r => r.data);
