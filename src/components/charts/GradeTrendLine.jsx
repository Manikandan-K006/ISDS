import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GradeTrendLine = ({ data, dataKey = 'gpa', xKey = 'term', color = '#6366F1' }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <YAxis domain={[0, 4]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GradeTrendLine;
