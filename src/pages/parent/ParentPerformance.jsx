import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { ProgressBar, Card, Badge } from '../../components/ui';
import { FiTrendingUp, FiBookOpen, FiClipboard, FiAward, FiCheckCircle } from 'react-icons/fi';
import { StatsSkeleton, ListSkeleton } from '../../components/shared/LoadingSkeleton';

export default function ParentPerformance() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    API.get('/parents/dashboard')
      .then(({ data: res }) => {
        const list = res?.students || [];
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingData(true);
    API.get(`/parents/students/${selectedId}/performance`)
      .then(({ data: res }) => setData(res))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [selectedId]);

  const attendance = data?.attendance || [];
  const assignments = data?.assignments || [];
  const quizResults = data?.quizResults || [];
  const enrollments = data?.enrollments || [];

  const attendanceRate = attendance.length
    ? Math.round((attendance.filter((a) => a.status === 'present' || a.status === 'late').length / attendance.length) * 100)
    : 0;

  const gradedAssignments = assignments.filter((a) => a.marks != null && a.assignment?.maxMarks);
  const avgAssignment = gradedAssignments.length
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.marks / a.assignment.maxMarks) * 100, 0) / gradedAssignments.length)
    : 0;

  const quizAvg = quizResults.length
    ? Math.round(quizResults.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizResults.length)
    : 0;

  const coursesCompleted = enrollments.filter((e) => e.isCompleted).length;

  const statCards = [
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: FiTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avg Assignment', value: `${avgAssignment}%`, icon: FiClipboard, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Quiz Average', value: `${quizAvg}%`, icon: FiAward, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Courses Completed', value: `${coursesCompleted}/${enrollments.length || 0}`, icon: FiBookOpen, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  if (loading) return <StatsSkeleton />;

  const selectedStudent = students.find((s) => s.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Performance</h1>
          <p className="theme-text mt-1">Academic performance overview for {selectedStudent?.name || 'your child'}</p>
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
                  <option key={s.id} value={s.id}>{s.name} • Sem {s.semester || s.class} • Reg {s.registerNumber || s.rollNumber}</option>
                ))}
              </select>
            </div>
          )}

          {loadingData ? (
            <>
              <StatsSkeleton />
              <ListSkeleton count={3} />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="theme-card rounded-2xl p-4 card-shadow-premium"
                  >
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <p className="text-xl font-bold theme-text">{stat.value}</p>
                    <p className="text-xs theme-text-muted mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h2 className="text-card-subtitle theme-text mb-4">Course Progress</h2>
                  <div className="space-y-4">
                    {enrollments.length === 0 && (
                      <p className="text-sm theme-text-muted text-center py-4">No enrolled courses</p>
                    )}
                    {enrollments.map((en) => (
                      <div key={en.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <FiBookOpen size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-sm theme-text truncate">{en.course?.title}</p>
                            <Badge color={en.isCompleted ? 'emerald' : 'indigo'} size="sm">
                              {en.isCompleted ? 'Completed' : `${Math.round(en.progress || 0)}%`}
                            </Badge>
                          </div>
                          <ProgressBar value={en.progress || 0} size="sm" color="indigo" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <h2 className="text-card-subtitle theme-text mb-4">Grades</h2>
                  <div className="space-y-3">
                    {assignments.length === 0 && (
                      <p className="text-sm theme-text-muted text-center py-4">No graded assignments yet</p>
                    )}
                    {assignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5">
                        <div className="min-w-0">
                          <p className="text-sm theme-text truncate">{a.assignment?.title}</p>
                          <p className="text-xs theme-text-muted mt-0.5">{a.feedback || 'No feedback'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${a.marks >= a.assignment?.maxMarks * 0.6 ? 'text-emerald-500' : 'text-rose-400'}`}>
                            {a.marks}/{a.assignment?.maxMarks}
                          </p>
                          {a.status && <Badge color="slate" size="sm">{a.status}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <h2 className="text-card-subtitle theme-text mb-4">Quiz Results</h2>
                {quizResults.length === 0 ? (
                  <p className="text-sm theme-text-muted text-center py-4">No quiz results yet</p>
                ) : (
                  <div className="space-y-3">
                    {quizResults.map((q) => (
                      <div key={q.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5">
                        <div className="min-w-0">
                          <p className="text-sm theme-text truncate">{q.quiz?.title}</p>
                          <p className="text-xs theme-text-muted mt-0.5">
                            Score {q.score} • Passing {q.quiz?.passingScore}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-bold ${q.percentage >= 60 ? 'text-emerald-500' : 'text-rose-400'}`}>
                            {q.percentage}%
                          </span>
                          {q.percentage >= 60 ? (
                            <FiCheckCircle size={16} className="text-emerald-500" />
                          ) : (
                            <FiTrendingUp size={16} className="text-rose-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
