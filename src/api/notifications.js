import API from './client';

export const getNotifications = (params) => API.get('/notifications', { params });
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
