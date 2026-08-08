import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/assignments` });

export const getAssignments = (params) => api.get('/', { params }).then(r => r.data);
export const getAssignmentById = (id) => api.get(`/${id}`).then(r => r.data);
export const createAssignment = (data) => api.post('/', data).then(r => r.data);
export const updateAssignment = (id, data) => api.put(`/${id}`, data).then(r => r.data);
export const deleteAssignment = (id) => api.delete(`/${id}`).then(r => r.data);
export const submitAssignment = (id, data) => api.post(`/${id}/submit`, data).then(r => r.data);
export const gradeSubmission = (submissionId, data) => api.put(`/grade/${submissionId}`, data).then(r => r.data);
