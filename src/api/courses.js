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

export const uploadFile = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/upload', fd).then(r => r.data);
};

export const addResource = (courseId, resource) =>
  api.post(`/${courseId}/resources`, resource).then(r => r.data);

export const updateResources = (courseId, resources) =>
  api.put(`/${courseId}/resources`, { resources }).then(r => r.data);

export const updateResource = (courseId, resourceId, data) =>
  api.put(`/${courseId}/resources/${resourceId}`, data).then(r => r.data);

export const deleteResource = (courseId, resourceId) =>
  api.delete(`/${courseId}/resources/${resourceId}`).then(r => r.data);

export const reorderResources = (courseId, resourceIds) =>
  api.put(`/${courseId}/resources/reorder`, { resourceIds }).then(r => r.data);
