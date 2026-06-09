import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-white text-[#0B1120] hover:bg-white/90 active:bg-white/80',
  secondary: 'bg-white/[0.06] text-white hover:bg-white/[0.10] active:bg-white/[0.14]',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.10]',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 active:bg-red-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, disabled, className = '', ...props }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors duration-150
      ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
    ) : Icon ? <Icon size={16} /> : null}
    {children}
  </motion.button>
);

export const Card = ({ children, className = '', hover = false, ...props }) => (
  <div className={`bg-[#0F172A] border border-white/[0.06] rounded-2xl ${hover ? 'hover:border-white/[0.12] transition-colors duration-150' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const Input = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm text-slate-400 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />}
      <input
        className={`w-full bg-white/[0.04] border ${error ? 'border-red-500/50' : 'border-white/[0.08]'} rounded-xl
          ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 text-white text-sm placeholder-slate-600
          focus:outline-none focus:border-white/20 transition-colors duration-150`}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const badgeColors = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  rose: 'bg-rose-500/10 text-rose-400',
  purple: 'bg-purple-500/10 text-purple-400',
  slate: 'bg-slate-500/10 text-slate-400',
};

export const Badge = ({ children, color = 'slate', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${badgeColors[color]} ${className}`}>
    {children}
  </span>
);

export const KpiCard = ({ label, value, icon: Icon, color = 'indigo', trend }) => {
  const dotColors = { indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400', rose: 'bg-rose-400', purple: 'bg-purple-400' };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          {Icon && <Icon className={`text-${color}-400`} size={18} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-white mb-0.5">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Card>
  );
};

export const Divider = ({ className = '' }) => <div className={`h-px bg-white/[0.06] ${className}`} />;
