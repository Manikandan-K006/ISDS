import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = 'indigo', variant = 'default', index = 0 }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: 'text-indigo-400', gradient: 'from-indigo-500 to-indigo-600' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: 'text-amber-400', gradient: 'from-amber-500 to-amber-600' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: 'text-rose-400', gradient: 'from-rose-500 to-rose-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
    slate: { bg: 'bg-slate-500/10', text: 'theme-text-muted', border: 'border-slate-500/20', icon: 'theme-text-muted', gradient: 'from-slate-500 to-slate-600' },
  };
  const c = colorMap[color] || colorMap.indigo;

  if (variant === 'gradient') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white shadow-lg shadow-${color}-500/20 relative overflow-hidden group cursor-pointer`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="theme-text/70 text-xs font-medium uppercase tracking-wider">{label}</span>
            {Icon && <Icon className="theme-text/60" size={20} />}
          </div>
          <div className="text-3xl font-bold mb-1 font-heading">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-sm theme-text/60">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="theme-card border theme-border rounded-2xl p-5 hover:border-[var(--border-light)] transition-all group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          {Icon && <Icon className={c.icon} size={20} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="theme-text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold theme-text font-heading">{value}</div>
    </motion.div>
  );
};

export default StatCard;
