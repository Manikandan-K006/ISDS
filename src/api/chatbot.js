import API from './client';

export const sendMessage = (data) => API.post('/chatbot', data).then(r => r.data);
