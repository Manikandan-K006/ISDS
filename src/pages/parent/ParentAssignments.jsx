import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { ProgressBar, Card, Badge } from '../../components/ui';
import { FiClipboard, FiBookOpen, FiFileText } from 'react-icons/fi';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';

const statusColor = (status) => {
  const map = { graded: 'emerald', late: 'amber', submitted: 'indigo', pending: 'amber', resubmitted: 'indigo' };
  return map[status] || 'slate';
};

export default function ParentAssignments() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/parents/dashboard')
      .then(({ data }) => {
        const list = data?.students || [];
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ListSkeleton count={4} />;

  const selectedStudent = students.find((s) => s.id === selectedId);
  const grades = selectedStudent?.recentGrades || [];
  const enrollments = selectedStudent?.enrollments || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Assignments</h1>
          <p className="theme-text mt-1">Track your child's assignments and course progress</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <FiBookOpen className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No students linked</p>
          <p className="theme-text-muted text-sm mt-1">Contact the administration to link a student profile.</p>
        </div>
      ) : (
        <>
          {students.length > 1 && (
            <div className="theme-card rounded-2xl p-5 card-shadow">
              <label className="block text-xs theme-text-muted font-medium mb-1.5">Student</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full max-w-sm theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} • Class {s.class} • Roll {s.rollNumber}</option>
                ))}
              </select>
            </div>
          )}

          <Card className="p-5">
            <h2 className="text-card-subtitle theme-text mb-4">Graded Assignments</h2>
            {grades.length === 0 ? (
              <div className="py-10 text-center">
                <FiFileText className="mx-auto theme-text-muted mb-3" size={36} />
                <p className="theme-text-muted text-sm">No graded assignments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {grades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5">
                    <div className="min-w-0">
                      <p className="text-sm theme-text truncate">{g.assignment?.title}</p>
                      <p className="text-xs theme-text-muted mt-0.5">
                        {g.submittedAt ? new Date(g.submittedAt).toLocaleDateString() : ''}
                        {g.feedback ? ` • ${g.feedback}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${g.marks >= g.assignment?.maxMarks * 0.6 ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {g.marks}/{g.assignment?.maxMarks}
                      </p>
                      <Badge color={statusColor(g.status)} size="sm" className="mt-1">
                        {g.status || (g.marks != null ? 'graded' : 'submitted')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-card-subtitle theme-text mb-4">Course Progress</h2>
            {enrollments.length === 0 ? (
              <p className="text-sm theme-text-muted text-center py-4">No enrolled courses</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((en) => (
                  <div key={en.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      {en.course?.thumbnail ? (
                        <img src={en.course.thumbnail} alt={en.course.title} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <FiClipboard size={18} className="text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-sm theme-text truncate">{en.course?.title}</p>
                        <span className="text-xs theme-text-muted shrink-0">{Math.round(en.progress || 0)}%</span>
                      </div>
                      <ProgressBar value={en.progress || 0} size="sm" color="indigo" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </motion.div>
  );
}
