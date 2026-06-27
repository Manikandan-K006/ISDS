import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================
   BUTTON
   ============================================================ */
const btnVariants = {
  primary: 'bg-[var(--primary)] text-white hover:brightness-110 active:brightness-95 shadow-sm shadow-[var(--primary)]/10',
  secondary: 'bg-[var(--hover)] theme-text hover:bg-[var(--active)] active:bg-[var(--subtle)]',
  outline: 'border border-[var(--border)] theme-text hover:bg-[var(--hover)] active:bg-[var(--active)] hover:border-[var(--text-muted)]',
  ghost: 'theme-text-muted hover:theme-text hover:bg-[var(--hover)] active:bg-[var(--active)]',
  danger: 'bg-[var(--danger-subtle)] text-[var(--danger)] hover:brightness-95 active:brightness-90',
  'primary-ghost': 'text-[var(--primary)] hover:bg-[var(--primary-muted)] active:bg-[var(--primary-subtle)]',
};

const btnSizes = {
  sm: 'px-3 py-1.5 text-caption rounded-lg',
  md: 'px-4 py-2 text-body rounded-xl',
  lg: 'px-5 py-2.5 text-body rounded-xl',
  xl: 'px-6 py-3 text-body rounded-xl',
};

export const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, iconRight, loading, disabled, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
    whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className={`inline-flex items-center justify-center gap-2 font-semibold
      transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]
      ${btnVariants[variant] || btnVariants.primary} ${btnSizes[size] || btnSizes.md}
      ${disabled || loading ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}
      select-none ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : Icon && !iconRight ? <Icon size={16} strokeWidth={2} /> : null}
    {children}
    {iconRight && !loading ? <iconRight size={16} strokeWidth={2} /> : null}
  </motion.button>
);

/* ============================================================
   INPUT
   ============================================================ */
export const Input = ({ icon: Icon, iconRight, label, error, success, hint, className = '', wrapperClass = '', ...props }) => (
  <div className={wrapperClass}>
    {label && (
      <label className="block text-caption theme-text-secondary font-medium mb-1.5">{label}</label>
    )}
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={16} className="theme-text-muted" strokeWidth={1.5} />
        </div>
      )}
      {iconRight && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <iconRight size={16} className="theme-text-muted" strokeWidth={1.5} />
        </div>
      )}
      <input
        className={`w-full bg-[var(--card-bg)] border rounded-xl px-3.5 py-2.5 text-body theme-text placeholder-theme-muted
          transition-all duration-150
          ${Icon ? 'pl-10' : 'pl-3.5'}
          ${iconRight ? 'pr-10' : 'pr-3.5'}
          ${error ? 'border-[var(--danger)]' : 'border-[var(--input-border)]'}
          ${!error ? 'focus:border-[var(--input-focus)] focus:ring-2 focus:ring-[var(--input-focus)]/10' : ''}
          focus:outline-none hover:border-[var(--text-muted)]`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-small text-[var(--danger)] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[var(--danger)]" />{error}</p>}
    {success && <p className="mt-1.5 text-small text-[var(--success)] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[var(--success)]" />{success}</p>}
    {hint && !error && !success && <p className="mt-1.5 text-small theme-text-muted">{hint}</p>}
  </div>
);

/* ============================================================
   SELECT
   ============================================================ */
export const Select = ({ icon: Icon, label, error, options = [], placeholder = 'Select...', className = '', wrapperClass = '', ...props }) => (
  <div className={wrapperClass}>
    {label && (
      <label className="block text-caption theme-text-secondary font-medium mb-1.5">{label}</label>
    )}
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon size={16} className="theme-text-muted" strokeWidth={1.5} />
        </div>
      )}
      <select
        className={`w-full bg-[var(--card-bg)] border rounded-xl px-3.5 py-2.5 text-body theme-text
          transition-all duration-150 appearance-none cursor-pointer
          ${Icon ? 'pl-10' : 'pl-3.5'} pr-10
          ${error ? 'border-[var(--danger)]' : 'border-[var(--input-border)]'}
          ${!error ? 'focus:border-[var(--input-focus)] focus:ring-2 focus:ring-[var(--input-focus)]/10' : ''}
          focus:outline-none hover:border-[var(--text-muted)]`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="mt-1.5 text-small text-[var(--danger)]">{error}</p>}
  </div>
);

/* ============================================================
   CARD
   ============================================================ */
export const Card = ({ children, className = '', hover = false, highlight = false, glow = false, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -3 } : undefined}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`theme-card border ${highlight ? 'border-[var(--primary)]/30' : 'theme-border'} rounded-2xl card-shadow-premium ${glow ? 'card-glow' : ''} ${hover ? 'cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

/* ============================================================
   BADGE
   ============================================================ */
const badgeVariants = {
  indigo: 'bg-[var(--primary-muted)] text-[var(--primary)]',
  emerald: 'bg-[var(--success-subtle)] text-[var(--success)]',
  amber: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
  rose: 'bg-[var(--danger-subtle)] text-[var(--danger)]',
  purple: 'bg-[var(--violet-subtle)] text-[var(--violet)]',
  slate: 'bg-[var(--subtle)] theme-text-muted',
  blue: 'bg-[var(--info-subtle)] text-[var(--info)]',
};

const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-small',
  lg: 'px-3 py-1 text-caption',
};

export const Badge = ({ children, color = 'slate', size = 'md', dot, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 font-semibold rounded-lg ${badgeVariants[color] || badgeVariants.slate} ${badgeSizes[size] || badgeSizes.md} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${color === 'emerald' ? 'bg-[var(--success)]' : color === 'amber' ? 'bg-[var(--warning)]' : color === 'rose' ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`} />}
    {children}
  </span>
);

/* ============================================================
   KPI CARD
   ============================================================ */
const iconBgLight = {
  indigo: 'bg-[var(--primary-muted)]',
  emerald: 'bg-[var(--success-subtle)]',
  amber: 'bg-[var(--warning-subtle)]',
  rose: 'bg-[var(--danger-subtle)]',
  violet: 'bg-[var(--violet-subtle)]',
  blue: 'bg-[var(--info-subtle)]',
};
const iconColorLight = {
  indigo: 'text-[var(--primary)]',
  emerald: 'text-[var(--success)]',
  amber: 'text-[var(--warning)]',
  rose: 'text-[var(--danger)]',
  violet: 'text-[var(--violet)]',
  blue: 'text-[var(--info)]',
};

export const KpiCard = ({ label, value, icon: Icon, color = 'indigo', trend, subtitle, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    className={`theme-card border theme-border rounded-2xl card-shadow-premium p-5 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBgLight[color] || iconBgLight.indigo} flex items-center justify-center`}>
        {Icon && <Icon className={`${iconColorLight[color] || iconColorLight.indigo}`} size={20} strokeWidth={1.5} />}
      </div>
      {trend != null && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-small font-semibold px-2 py-0.5 rounded-lg ${
            trend > 0 ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--danger-subtle)] text-[var(--danger)]'
          }`}
        >
          <span className="mr-0.5">{trend > 0 ? '↑' : '↓'}</span>
          {Math.abs(trend)}%
        </motion.span>
      )}
    </div>
    <p className="text-hero text-3xl font-bold theme-text mb-0.5 tracking-tight">{value}</p>
    <p className="text-caption theme-text-muted">{label}</p>
    {subtitle && <p className="text-small theme-text-muted mt-1.5">{subtitle}</p>}
  </motion.div>
);

/* ============================================================
   PROGRESS BAR
   ============================================================ */
export const ProgressBar = ({ value = 0, max = 100, size = 'md', color = 'indigo', showLabel = false, className = '' }) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const colors = {
    indigo: 'bg-[var(--primary)]',
    emerald: 'bg-[var(--success)]',
    amber: 'bg-[var(--warning)]',
    rose: 'bg-[var(--danger)]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-[var(--subtle)] rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color] || colors.indigo} relative`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" style={{ opacity: 0.15 }} />
        </motion.div>
      </div>
      {showLabel && <span className="text-small font-semibold theme-text-muted">{Math.round(pct)}%</span>}
    </div>
  );
};

/* ============================================================
   DIVIDER
   ============================================================ */
export const Divider = ({ className = '', label }) => {
  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-small theme-text-muted font-medium">{label}</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
    );
  }
  return <div className={`h-px bg-[var(--border)] ${className}`} />;
};

/* ============================================================
   MODAL
   ============================================================ */
export const Modal = ({ open, onClose, children, className = '', size = 'md' }) => {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative theme-card border theme-border rounded-2xl shadow-xl ${sizes[size] || sizes.md} w-full max-h-[85vh] overflow-y-auto ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

/* ============================================================
   PAGE TRANSITION
   ============================================================ */
export const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ============================================================
   EMPTY STATE
   ============================================================ */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center"
  >
    <div className="w-20 h-20 rounded-2xl bg-[var(--subtle)] flex items-center justify-center mb-5 border border-[var(--border)]">
      {Icon && <Icon className="theme-text-muted" size={32} strokeWidth={1.5} />}
    </div>
    <h3 className="text-card-subtitle theme-text mb-2">{title}</h3>
    <p className="text-caption theme-text-muted max-w-sm mb-8">{description}</p>
    {action}
  </motion.div>
);

/* ============================================================
   SECTION HEADER
   ============================================================ */
export const SectionHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h2 className="text-card-title theme-text">{title}</h2>
      {description && <p className="text-caption theme-text-muted mt-1">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/* ============================================================
   TABS
   ============================================================ */
export const Tabs = ({ tabs, active, onChange, variant = 'default' }) => {
  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-small font-medium transition-all duration-150 ${
              active === tab.id
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--subtle)] theme-text-muted hover:theme-text hover:bg-[var(--hover)]'
            }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-micro ${
                active === tab.id ? 'bg-white/20' : 'bg-[var(--hover)] theme-text-muted'
              }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[var(--subtle)] border border-[var(--border)] w-fit">
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-caption font-medium transition-all duration-150 ${
            active === tab.id
              ? 'bg-[var(--card-bg)] shadow-sm theme-text'
              : 'theme-text-muted hover:theme-text'
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-micro ${
              active === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--subtle)] theme-text-muted'
            }`}>
              {tab.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

/* ============================================================
   SWITCH / TOGGLE
   ============================================================ */
export const Switch = ({ checked, onChange, label, disabled }) => (
  <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    <motion.button
      onClick={() => !disabled && onChange?.(!checked)}
      animate={{ backgroundColor: checked ? 'var(--primary)' : 'var(--input-border)' }}
      transition={{ duration: 0.15 }}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${disabled ? '' : 'cursor-pointer'}`}
      type="button"
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
      />
    </motion.button>
    {label && <span className="text-caption theme-text font-medium">{label}</span>}
  </label>
);

/* ============================================================
   CHIP
   ============================================================ */
export const Chip = ({ children, onRemove, color = 'slate', className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-small font-medium transition-colors
    ${color === 'indigo' ? 'bg-[var(--primary-muted)] text-[var(--primary)]' :
      color === 'emerald' ? 'bg-[var(--success-subtle)] text-[var(--success)]' :
      color === 'amber' ? 'bg-[var(--warning-subtle)] text-[var(--warning)]' :
      color === 'rose' ? 'bg-[var(--danger-subtle)] text-[var(--danger)]' :
      'bg-[var(--subtle)] theme-text-muted'
    } ${className}`}>
    {children}
    {onRemove && (
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity ml-0.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </span>
);

/* ============================================================
   AVATAR
   ============================================================ */
export const Avatar = ({ name, size = 'md', src, className = '' }) => {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg', '2xl': 'w-20 h-20 text-xl' };
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover border-2 border-[var(--border)] ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeMap[size] || sizeMap.md} rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white font-semibold flex items-center justify-center border-2 border-[var(--border)] shadow-sm ${className}`}>
      {initials}
    </div>
  );
};

/* ============================================================
   DROPDOWN MENU
   ============================================================ */
const DropdownContext = createContext();
export const DropdownMenu = ({ children, trigger, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const handleEscape = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEscape); };
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={ref}>
        <div onClick={() => setOpen(!open)}>{trigger}</div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className={`absolute z-50 mt-1.5 min-w-[180px] theme-card border theme-border rounded-xl shadow-xl py-1 ${
                align === 'right' ? 'right-0' : 'left-0'
              }`}
              onClick={() => setOpen(false)}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownItem = ({ children, icon: Icon, danger, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-caption transition-colors
      ${danger ? 'text-[var(--danger)] hover:bg-[var(--danger-subtle)]' : 'theme-text hover:bg-[var(--hover)]'}
      ${className}`}
  >
    {Icon && <Icon size={15} strokeWidth={1.5} className={danger ? 'text-[var(--danger)]' : 'theme-text-muted'} />}
    {children}
  </button>
);

/* ============================================================
   TABLE
   ============================================================ */
export const TableWrapper = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card-bg)] ${className}`}>
    {children}
  </div>
);

export const Table = ({ children, className = '' }) => (
  <table className={`w-full text-sm ${className}`}>{children}</table>
);

export const Th = ({ children, className = '' }) => (
  <th className={`text-left py-3 px-4 theme-text-muted font-semibold text-[11px] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--subtle)] ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`py-3 px-4 border-b border-[var(--border-light)] theme-text text-caption ${className}`}>
    {children}
  </td>
);

export const Tr = ({ children, className = '', onClick }) => (
  <tr className={`transition-colors hover:bg-[var(--hover)] ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
    {children}
  </tr>
);

/* ============================================================
   TOOLTIP
   ============================================================ */
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 pointer-events-none ${positions[position] || positions.top}`}
          >
            <div className="bg-[var(--text)] text-[var(--text-inverse)] text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================
   NOTIFICATION DOT
   ============================================================ */
export const NotificationDot = ({ count, className = '' }) => {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold leading-none ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

/* ============================================================
   SKELETON VARIANTS
   ============================================================ */
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = () => (
  <div className="theme-card border theme-border rounded-2xl p-5 space-y-3">
    <Skeleton className="h-11 w-11 rounded-xl" />
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="theme-card border theme-border rounded-2xl p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex gap-4 p-4">
      {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-3 flex-1" />)}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4">
        {[1,2,3,4,5].map(j => <Skeleton key={j} className="h-4 flex-1" />)}
      </div>
    ))}
  </div>
);

/* ============================================================
   STATS GRID
   ============================================================ */
export const StatsGrid = ({ children, columns = 4 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
    {children}
  </div>
);
