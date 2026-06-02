import { useState, useEffect } from 'react';
import { getCourses } from '../api/courses';
import { MOCK_COURSES } from '../utils/constants';

export const useCourses = (params) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getCourses(params);
        setCourses(data);
      } catch {
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [JSON.stringify(params)]);

  return { courses, loading, error };
};
