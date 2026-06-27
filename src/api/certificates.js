import API from './client';

export const getCertificates = (params) => API.get('/certificates', { params }).then(r => r.data);
export const issueCertificate = (data) => API.post('/certificates', data).then(r => r.data);
export const verifyCertificate = (certificateId) => API.get(`/certificates/verify/${certificateId}`).then(r => r.data);
export const revokeCertificate = (id) => API.put(`/certificates/${id}/revoke`).then(r => r.data);
