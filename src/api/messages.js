import API from './client';

export const getMessages = (params = {}) => API.get('/messages', { params }).then(r => r.data);
export const getConversation = (userId) => API.get(`/messages/conversation/${userId}`).then(r => r.data);
export const sendMessage = (data) => API.post('/messages', data).then(r => r.data);
