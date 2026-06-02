import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = 'indigo', variant = 'default' }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: 'text-amber-400' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: 'text-rose-400' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: 'text-slate-400' },
  };
  const c = colorMap[color] || colorMap.indigo;

  if (variant === 'gradient') {
    const gradMap = {
      indigo: 'from-indigo-600 to-indigo-800',
      emerald: 'from-emerald-600 to-emerald-800',
      amber: 'from-amber-600 to-amber-800',
      rose: 'from-rose-600 to-rose-800',
    };
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${gradMap[color] || gradMap.indigo} rounded-xl p-5 text-white shadow-lg relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/70 text-sm font-medium">{label}</span>
            {Icon && <Icon className="text-white/80" size={22} />}
          </div>
          <div className="text-3xl font-bold mb-1">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-white/70">
              {trend === 'up' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-5 border ${c.border} hover:bg-white/[0.07] transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.bg}`}>
          {Icon && <Icon className={c.icon} size={20} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
};

export default StatCard;
