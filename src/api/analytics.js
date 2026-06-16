import API from './client';

export const getDashboardAnalytics = () => API.get('/analytics/dashboard').then(r => r.data);
export const getCourseAnalytics = () => API.get('/analytics/courses').then(r => r.data);
export const getStudentAnalytics = (id) => API.get(`/analytics/student/${id}`).then(r => r.data);
