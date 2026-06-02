import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/analytics` });

export const getClassAnalytics = (className) => api.get('/', { params: { class: className } }).then(r => r.data);
export const getStudentAnalytics = (id) => api.get(`/student/${id}`).then(r => r.data);
