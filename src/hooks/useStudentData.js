import { useState, useEffect } from 'react';
import { MOCK_STUDENT, MOCK_ATTENDANCE, MOCK_ASSIGNMENTS, MOCK_CERTIFICATES, MOCK_TROPHIES, MOCK_ACTIVITY_FEED } from '../utils/constants';

export const useStudentData = () => {
  const [student, setStudent] = useState(MOCK_STUDENT);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [certificates, setCertificates] = useState(MOCK_CERTIFICATES);
  const [trophies, setTrophies] = useState(MOCK_TROPHIES);
  const [activity, setActivity] = useState(MOCK_ACTIVITY_FEED);
  const [loading, setLoading] = useState(false);

  return { student, setStudent, attendance, assignments, certificates, trophies, activity, loading };
};
