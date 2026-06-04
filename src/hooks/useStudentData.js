import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/constants';
import { useAuth } from './useAuth';

const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('isds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useStudentData = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [activity, setActivity] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const uid = user._id || user.id;

      const [studRes, attRes, assignRes, certRes, trophyRes, courseRes] = await Promise.all([
        api.get(`/students/${uid}`).catch(() => null),
        api.get(`/attendance?studentId=${uid}`).catch(() => null),
        api.get(`/assignments`).catch(() => null),
        api.get(`/certificates?studentId=${uid}`).catch(() => null),
        api.get(`/trophies?studentId=${uid}`).catch(() => null),
        api.get(`/courses`).catch(() => null),
      ]);

      if (studRes?.data) setStudent(studRes.data);
      if (attRes?.data) setAttendance(attRes.data);
      if (assignRes?.data) setAssignments(assignRes.data);
      if (certRes?.data) setCertificates(certRes.data);
      if (trophyRes?.data) setTrophies(trophyRes.data);
      if (courseRes?.data) setCourses(courseRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { student, setStudent, attendance, assignments, certificates, trophies, activity, courses, loading, error, refetch: fetchData };
};
