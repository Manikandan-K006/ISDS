import API from './client';

export const getConversations = () => API.get('/messages/conversations').then(r => r.data);
export const getConversation = (userId) => API.get(`/messages/conversations/${userId}`).then(r => r.data);
export const sendMessage = (data) => API.post('/messages', data).then(r => r.data);
