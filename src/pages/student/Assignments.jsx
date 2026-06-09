import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClipboard, FiClock, FiCheckCircle, FiSend,
  FiFileText, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDateTime, getDeadlineStatus } from '../../utils/helpers';

const TABS = ['All', 'Pending', 'Submitted', 'Graded'];

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  submitted: { label: 'Submitted', bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  graded: { label: 'Graded', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
};

const Assignments = () => {
  const { assignments, loading, error } = useStudentData();
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-400">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06]"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Assignments</h1>
        <p className="text-slate-400 mt-1">Track and submit your assignments</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', icon: FiClipboard },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', icon: FiClock },
          { label: 'Submitted', value: stats.submitted, color: 'text-blue-400', icon: FiSend },
          { label: 'Graded', value: stats.graded, color: 'text-emerald-400', icon: FiCheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
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

      <div className="flex gap-1 p-1 bg-[#0F172A] rounded-xl border border-white/[0.06] w-fit">
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

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filtered.map((a, i) => {
              const deadline = getDeadlineStatus(a.deadline);
              const status = statusConfig[a.status];
              const isOverdue = deadline.label === 'Overdue' && a.status === 'pending';

              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[#0F172A] rounded-2xl border border-white/[0.06] overflow-hidden"
                >
                  <div
                    className="p-4 lg:p-5 cursor-pointer"
                    onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <FiFileText className="text-indigo-400" size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-white truncate">{a.title}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              isOverdue ? 'bg-rose-500/10 text-rose-300' : `${status.bg} ${status.text}`
                            }`}>
                              {isOverdue ? 'Overdue' : status.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{a.courseName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium ${
                          isOverdue ? 'text-rose-400' : deadline.color
                        }`}>{deadline.label}</span>
                        {expanded === a._id ? (
                          <FiChevronUp className="text-slate-500" size={16} />
                        ) : (
                          <FiChevronDown className="text-slate-500" size={16} />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded === a._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-3">
                            <p className="text-sm text-slate-400">{a.description}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                              <span>Max Marks: {a.maxMarks}</span>
                              {a.submittedAt && <span>Submitted: {formatDateTime(a.submittedAt)}</span>}
                              <span>Deadline: {formatDateTime(a.deadline)}</span>
                            </div>
                            {a.grade !== undefined && (
                              <div className="bg-emerald-500/10 rounded-xl px-4 py-2 flex items-center justify-between">
                                <span className="text-sm text-slate-400">Grade</span>
                                <span className="text-lg font-bold text-emerald-400">{a.grade}/{a.maxMarks}</span>
                              </div>
                            )}
                            {a.feedback && (
                              <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                                <p className="text-xs text-slate-500 mb-1">Feedback</p>
                                <p className="text-sm text-slate-300">{a.feedback}</p>
                              </div>
                            )}
                            {a.status === 'pending' && (
                              <button className="w-full py-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2">
                                <FiSend size={16} /> Submit Assignment
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
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
  );
};

export default Assignments;
