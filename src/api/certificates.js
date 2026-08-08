import API from './client';

export const getCertificates = (params) => API.get('/certificates', { params }).then(r => r.data);

export const getCertificateById = (id) => API.get(`/certificates/${id}`).then(r => r.data);

export const issueCertificate = (data) => API.post('/certificates', data).then(r => r.data);

export const verifyCertificate = (certificateId) => API.get(`/certificates/verify/${certificateId}`).then(r => r.data);

export const revokeCertificate = (id) => API.put(`/certificates/${id}/revoke`).then(r => r.data);

export const restoreCertificate = (id) => API.put(`/certificates/${id}/restore`).then(r => r.data);

export const regenerateCertificate = (id) => API.put(`/certificates/${id}/regenerate`).then(r => r.data);

export const deleteCertificate = (id) => API.delete(`/certificates/${id}`).then(r => r.data);

export const trackDownload = (id) => API.put(`/certificates/${id}/download`).then(r => r.data);

export const trackShare = (id) => API.put(`/certificates/${id}/share`).then(r => r.data);

export const getCertificateStats = () => API.get('/certificates/admin/stats').then(r => r.data);

export const getVerificationLogs = () => API.get('/certificates/admin/logs').then(r => r.data);

export const getCertificateFileUrl = (id, type) => {
  const cleanId = id.replace(/[^a-zA-Z0-9-]/g, '_');
  return `${API.defaults.baseURL}/certificates/file/${type}/${cleanId}`;
};
