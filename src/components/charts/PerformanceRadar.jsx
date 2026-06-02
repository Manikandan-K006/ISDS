import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PerformanceRadar = ({ studentData, averageData }) => {
  const data = [
    { dimension: 'Academics', student: studentData?.academics || 85, average: averageData?.academics || 72 },
    { dimension: 'Attendance', student: studentData?.attendance || 90, average: averageData?.attendance || 80 },
    { dimension: 'Co-curricular', student: studentData?.cocurricular || 70, average: averageData?.cocurricular || 55 },
    { dimension: 'Discipline', student: studentData?.discipline || 95, average: averageData?.discipline || 85 },
    { dimension: 'Assignments', student: studentData?.assignments || 80, average: averageData?.assignments || 68 },
    { dimension: 'Certificates', student: studentData?.certificates || 75, average: averageData?.certificates || 50 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
        <Radar name="Student" dataKey="student" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Class Average" dataKey="average" stroke="#64748B" fill="#64748B" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
        />
        <Legend wrapperStyle={{ color: '#94A3B8' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceRadar;
