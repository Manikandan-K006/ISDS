import { useState } from 'react';
import { FiClipboard, FiClock, FiSend, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDateTime, getDeadlineStatus } from '../../utils/helpers';
import { Card, Badge } from '../../components/ui';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';

const TABS = ['All', 'Pending', 'Submitted', 'Graded'];

const deadlineColorMap = {
  'text-rose': 'text-rose-400',
  'text-amber': 'text-amber-400',
  'text-emerald': 'text-emerald-400',
};

const Assignments = () => {
  const { assignments, loading, error, refetch } = useStudentData();
  const [activeTab, setActiveTab] = useState('All');

  if (loading) return <ListSkeleton count={4} />;

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
        <FiAlertCircle className="mx-auto text-rose-400 mb-3" size={40} />
        <p className="text-rose-300 font-medium mb-2">Failed to load assignments</p>
        <p className="text-rose-400/70 text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-colors"
        >
          <FiRefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
  };

  const filtered = activeTab === 'All'
    ? assignments
    : assignments.filter(a => a.status === activeTab.toLowerCase());

  const renderCard = (a) => {
    const deadline = getDeadlineStatus(a.deadline);
    const isOverdue = deadline.label === 'Overdue' && a.status === 'pending';

    return (
      <Card key={a._id} className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge color="slate">{a.courseName}</Badge>
            {a.type && (
              <Badge color="indigo">{a.type === 'file' ? 'File' : 'Text'}</Badge>
            )}
          </div>
          <span className={`shrink-0 text-xs font-medium ${isOverdue ? 'text-rose-400' : deadlineColorMap[deadline.color] || 'text-slate-400'}`}>
            {isOverdue ? 'Overdue' : deadline.label}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white mb-1">{a.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{a.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            {a.status === 'pending' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
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
          </div>
          {isOverdue && <FiAlertCircle size={14} className="text-rose-400" />}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Assignments</h1>
          <p className="text-sm text-slate-400">{stats.total} total</p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-white/[0.06] text-sm text-slate-300 font-medium">
          {stats.total}
        </span>
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
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs opacity-60">
                {tab === 'Pending' ? stats.pending : tab === 'Submitted' ? stats.submitted : stats.graded}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(a => renderCard(a))}
        </div>
      ) : (
        <div className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-12 text-center">
          <FiClipboard className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-base font-medium text-white mb-1">No assignments found</h3>
          <p className="text-sm text-slate-400">All caught up! No {activeTab.toLowerCase()} assignments.</p>
        </div>
      )}
    </div>
  );
};

export default Assignments;
