import { useState } from 'react';

const ParticipationHeatmap = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = Array.from({ length: 8 }, (_, i) => `P${i + 1}`);

  const getColor = (val) => {
    if (!val || val === 0) return 'bg-slate-800';
    if (val < 25) return 'bg-emerald-900/50';
    if (val < 50) return 'bg-emerald-700/50';
    if (val < 75) return 'bg-emerald-500/50';
    return 'bg-emerald-400/70';
  };

  return (
    <div className="glass rounded-xl p-5 overflow-x-auto">
      <h3 className="theme-text font-semibold mb-4">Class Participation Heatmap</h3>
      <div className="grid grid-cols-[auto_repeat(8,1fr)] gap-1 min-w-[400px]">
        <div />
        {periods.map(p => <div key={p} className="text-xs theme-text-muted text-center py-1">{p}</div>)}
        {days.map(day => (
          <>
            <div key={day} className="text-xs theme-text-muted py-1 pr-2">{day}</div>
            {periods.map((_, i) => {
              const val = data?.[day]?.[i] || 0;
              return (
                <div
                  key={`${day}-${i}`}
                  className={`aspect-square rounded ${getColor(val)} cursor-pointer hover:ring-1 hover:ring-white/30 transition-all`}
                  title={`${day} ${periods[i]}: ${val}%`}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};

export default ParticipationHeatmap;
