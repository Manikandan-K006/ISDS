import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PerformanceRadar = ({ studentData, averageData }) => {
  const data = [
    { dimension: 'Academics', student: studentData?.academics || 0, average: averageData?.academics || 0 },
    { dimension: 'Attendance', student: studentData?.attendance || 0, average: averageData?.attendance || 0 },
    { dimension: 'Co-curricular', student: studentData?.cocurricular || 0, average: averageData?.cocurricular || 0 },
    { dimension: 'Discipline', student: studentData?.discipline || 0, average: averageData?.discipline || 0 },
    { dimension: 'Assignments', student: studentData?.assignments || 0, average: averageData?.assignments || 0 },
    { dimension: 'Certificates', student: studentData?.certificates || 0, average: averageData?.certificates || 0 },
  ];

  const allZero = data.every(d => d.student === 0 && d.average === 0);

  if (allZero) {
    return (
      <div className="flex items-center justify-center h-[350px] theme-text-muted text-sm">
        No performance data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
        <Radar name="Student" dataKey="student" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Class Average" dataKey="average"             stroke="var(--text-muted)" fill="var(--text-muted)" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip
          contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
        />
        <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceRadar;
