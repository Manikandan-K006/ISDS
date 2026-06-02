import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/courses` });

export const getCourses = (params) => api.get('/', { params }).then(r => r.data);
export const getCourseById = (id) => api.get(`/${id}`).then(r => r.data);
export const createCourse = (data) => api.post('/', data).then(r => r.data);
export const updateCourse = (id, data) => api.put(`/${id}`, data).then(r => r.data);
export const deleteCourse = (id) => api.delete(`/${id}`).then(r => r.data);
export const enrollCourse = (courseId) => api.post(`/${courseId}/enroll`).then(r => r.data);
export const updateProgress = (courseId, data) => api.put(`/${courseId}/progress`, data).then(r => r.data);
