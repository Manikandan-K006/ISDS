import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/attendance` });

export const getAttendance = (params) => api.get('/', { params }).then(r => r.data);
export const markAttendance = (data) => api.post('/', data).then(r => r.data);
export const applyLeave = (data) => api.post('/leave', data).then(r => r.data);
