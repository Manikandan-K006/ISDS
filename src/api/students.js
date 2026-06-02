import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/students` });

export const getStudents = (params) => api.get('/', { params }).then(r => r.data);
export const getStudentById = (id) => api.get(`/${id}`).then(r => r.data);
export const updateStudent = (id, data) => api.put(`/${id}`, data).then(r => r.data);
export const getStudentAnalytics = (id) => api.get(`/${id}/analytics`).then(r => r.data);
