import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/chatbot` });

export const sendMessage = (data) => api.post('/', data).then(r => r.data);
