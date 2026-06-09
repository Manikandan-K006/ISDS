import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClipboard, FiClock, FiCheckCircle, FiSend,
  FiFileText, FiAlertCircle, FiRefreshCw, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDateTime, getDeadlineStatus, truncate } from '../../utils/helpers';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';

const TABS = ['All', 'Pending', 'Submitted', 'Graded'];

const columnConfig = {
  pending: {
    title: 'Pending', icon: FiClock, bg: 'bg-amber-500/10',
    headerBg: 'bg-amber-500/10', headerText: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300',
    cardBorder: 'border-l-amber-500/30',
  },
  submitted: {
    title: 'Submitted', icon: FiSend, bg: 'bg-indigo-500/10',
    headerBg: 'bg-indigo-500/10', headerText: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300',
    cardBorder: 'border-l-indigo-500/30',
  },
  graded: {
    title: 'Graded', icon: FiCheckCircle, bg: 'bg-emerald-500/10',
    headerBg: 'bg-emerald-500/10', headerText: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300',
    cardBorder: 'border-l-emerald-500/30',
  },
};

const Assignments = () => {
  const { assignments, loading, error, refetch } = useStudentData();
  const [activeTab, setActiveTab] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const scrollRefs = useRef({});

  if (loading) return <ListSkeleton count={4} />;

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center"
    >
      <FiAlertCircle className="mx-auto text-rose-400 mb-3" size={40} />
      <p className="text-rose-300 font-medium mb-2">Failed to load assignments</p>
      <p className="text-rose-400/70 text-sm mb-4">{error}</p>
      <button
        onClick={refetch}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-colors"
      >
        <FiRefreshCw size={14} /> Retry
      </button>
    </motion.div>
  );

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
  };

  const filtered = activeTab === 'All'
    ? assignments
    : assignments.filter(a => a.status === activeTab.toLowerCase());

  const grouped = {
    pending: assignments.filter(a => a.status === 'pending'),
    submitted: assignments.filter(a => a.status === 'submitted'),
    graded: assignments.filter(a => a.status === 'graded'),
  };

  const toggleExpanded = (id) => setExpandedId(expandedId === id ? null : id);

  const renderCard = (a) => {
    const deadline = getDeadlineStatus(a.deadline);
    const isOverdue = deadline.label === 'Overdue' && a.status === 'pending';
    const isExpanded = expandedId === a._id;

    return (
      <motion.div
        key={a._id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0F172A] rounded-2xl border border-white/[0.06] border-l-2 overflow-hidden hover:border-white/[0.12] transition-colors"
      >
        <div className="p-4 cursor-pointer" onClick={() => toggleExpanded(a._id)}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-slate-400 uppercase tracking-wider shrink-0">
                {a.courseName}
              </span>
              {a.type && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 shrink-0">
                  {a.type === 'file' ? 'File' : 'Text'}
                </span>
              )}
            </div>
            <span className={`shrink-0 text-xs font-medium ${isOverdue ? 'text-rose-400' : deadline.color}`}>
              {isOverdue ? 'Overdue' : deadline.label}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white mb-1">{a.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{a.description}</p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            {a.status === 'pending' && (
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <FiSend size={12} /> Submit
              </button>
            )}
            {a.status === 'submitted' && (
              <span className="text-xs text-indigo-400 flex items-center gap-1">
                <FiCheckCircle size={12} /> Submitted {a.submittedAt ? formatDateTime(a.submittedAt) : ''}
              </span>
            )}
            {a.status === 'graded' && (
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                a.grade >= (a.maxMarks / 2)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                {a.grade}/{a.maxMarks}
              </span>
            )}
            <div className="flex items-center gap-1">
              {isOverdue && <FiAlertCircle size={12} className="text-rose-400" />}
              {isExpanded ? <FiChevronUp size={14} className="text-slate-600" /> : <FiChevronDown size={14} className="text-slate-600" />}
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-3">
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Max Marks: {a.maxMarks}</span>
                    <span>Deadline: {formatDateTime(a.deadline)}</span>
                    {a.submittedAt && <span>Submitted: {formatDateTime(a.submittedAt)}</span>}
                  </div>
                  {a.feedback && (
                    <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                      <p className="text-xs text-slate-500 mb-1">Feedback</p>
                      <p className="text-sm text-slate-300">{a.feedback}</p>
                    </div>
                  )}
                  {a.status === 'pending' && (
                    <button className="w-full py-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2">
                      <FiSend size={14} /> Submit Assignment
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderColumn = (status) => {
    const cfg = columnConfig[status];
    const items = grouped[status];

    return (
      <div key={status} className="flex flex-col min-w-[300px] w-[300px] lg:w-full flex-1">
        <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${cfg.headerBg} border border-white/[0.06] border-b-0`}>
          <div className="flex items-center gap-2">
            <cfg.icon size={14} className={cfg.headerText} />
            <span className={`text-sm font-semibold ${cfg.headerText}`}>{cfg.title}</span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.badge}`}>{items.length}</span>
        </div>
        <div
          ref={(el) => scrollRefs.current[status] = el}
          className={`flex-1 ${cfg.bg} border border-white/[0.06] rounded-b-2xl p-3 space-y-3 max-h-[600px] overflow-y-auto`}
        >
          <AnimatePresence mode="popLayout">
            {items.length > 0 ? (
              items.map(renderCard)
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <FiClipboard size={28} className="text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">No {cfg.title.toLowerCase()} assignments</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06]"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Assignments</h1>
            <p className="text-slate-400 mt-1">Track and submit your assignments</p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white/[0.06] text-sm text-slate-300 font-medium">
            {stats.total} Total
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: FiClock },
          { label: 'Submitted', value: stats.submitted, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: FiSend },
          { label: 'Graded', value: stats.graded, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FiCheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-[#0F172A] rounded-xl border border-white/[0.06] w-fit lg:hidden">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4"
        >
          {renderColumn('pending')}
          {renderColumn('submitted')}
          {renderColumn('graded')}
        </motion.div>
      </div>

      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filtered.map(a => renderCard(a))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-12 text-center"
            >
              <FiClipboard className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-white mb-1">No assignments found</h3>
              <p className="text-sm text-slate-400">All caught up! No {activeTab.toLowerCase()} assignments.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Assignments;
