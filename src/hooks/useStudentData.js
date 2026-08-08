import { useState, useEffect, useCallback } from 'react';
import API from '../api/client';
import { useAuth } from './useAuth';

const initialState = {
  student: null,
  attendance: [],
  assignments: [],
  certificates: [],
  trophies: [],
  courses: [],
  loading: true,
  error: null,
};

export const useStudentData = () => {
  const { user } = useAuth();
  const [state, setState] = useState(initialState);

  const fetchData = useCallback(async () => {
    const uid = user?._id || user?.id;
    if (!uid) {
      setState(s => ({ ...s, loading: false, error: 'User not authenticated' }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    try {
      const results = await Promise.allSettled([
        API.get(`/students/${uid}`),
        API.get(`/attendance?studentId=${uid}`),
        API.get('/assignments'),
        API.get(`/certificates?studentId=${uid}`),
        API.get(`/trophies?studentId=${uid}`),
        API.get('/courses'),
      ]);

      const [studRes, attRes, assignRes, certRes, trophyRes, courseRes] = results;
      const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message);

      setState({
        student: studRes.status === 'fulfilled' ? studRes.value.data : null,
        attendance: attRes.status === 'fulfilled' ? attRes.value.data : [],
        assignments: assignRes.status === 'fulfilled' ? assignRes.value.data : [],
        certificates: certRes.status === 'fulfilled'
          ? (Array.isArray(certRes.value.data) ? certRes.value.data : (certRes.value.data?.certificates || []))
          : [],
        trophies: trophyRes.status === 'fulfilled' ? trophyRes.value.data : [],
        courses: courseRes.status === 'fulfilled' ? courseRes.value.data : [],
        loading: false,
        error: errors.length > 0 ? errors.join('; ') : null,
      });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, [user?._id, user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
};
