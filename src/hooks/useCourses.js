import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({ baseURL: `${API_BASE}/api/courses` });

export const useCourses = (params) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/', { params });
        setCourses(data);
      } catch (err) {
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [JSON.stringify(params)]);

  return { courses, loading, error };
};
