import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600',
  secondary: 'bg-[var(--hover)] theme-text hover:bg-[var(--subtle)] active:bg-[var(--hover)]',
  ghost: 'theme-text-muted hover:theme-text hover:bg-[var(--hover)] active:bg-[var(--subtle)]',
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
  <div className={`theme-card border theme-border rounded-2xl ${hover ? 'hover:border-[var(--border-light)] transition-colors duration-150' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const Input = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm theme-text-muted mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />}
      <input
        className={`w-full theme-input border ${error ? 'border-red-500/50' : 'theme-border-light'} rounded-xl
          ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 theme-text text-sm placeholder:text-slate-500
          focus:outline-none focus:border-[var(--text-muted)] transition-colors duration-150`}
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

const iconBg = { indigo: 'bg-indigo-500/10', emerald: 'bg-emerald-500/10', amber: 'bg-amber-500/10', rose: 'bg-rose-500/10', purple: 'bg-purple-500/10' };
const iconText = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400', purple: 'text-purple-400' };

export const KpiCard = ({ label, value, icon: Icon, color = 'indigo', trend }) => {
  const dotColors = { indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400', rose: 'bg-rose-400', purple: 'bg-purple-400' };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg[color] || iconBg.indigo} flex items-center justify-center`}>
          {Icon && <Icon className={`${iconText[color] || iconText.indigo}`} size={18} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold theme-text mb-0.5">{value}</p>
      <p className="text-sm theme-text-muted">{label}</p>
    </Card>
  );
};

export const Divider = ({ className = '' }) => <div className={`h-px theme-border ${className}`} />;
