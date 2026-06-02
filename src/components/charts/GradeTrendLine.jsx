import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GradeTrendLine = ({ data, dataKey = 'gpa', xKey = 'term', color = '#6366F1' }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <YAxis domain={[0, 4]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GradeTrendLine;
