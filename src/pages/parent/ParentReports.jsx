import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { Card, Badge, ProgressBar } from '../../components/ui';
import { FiPrinter, FiTrendingUp, FiAward, FiBookOpen, FiStar, FiCheckCircle } from 'react-icons/fi';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';

export default function ParentReports() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

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

  useEffect(() => {
    if (!selectedId) return;
    setLoadingData(true);
    API.get(`/parents/students/${selectedId}/report`)
      .then(({ data }) => setReport(data))
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [selectedId]);

  if (loading) return <CardSkeleton />;

  const student = report?.student || students.find((s) => s.id === selectedId);
  const summary = report?.report || {};
  const attendance = summary.attendance || {};
  const grades = summary.grades || {};
  const quizzes = summary.quizzes || {};
  const courses = summary.courses || [];

  const summaryCards = [
    { label: 'Attendance Rate', value: attendance.rate != null ? `${attendance.rate}%` : 'N/A', sub: `${attendance.present ?? 0}/${attendance.total ?? 0} days`, icon: FiTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Grade Average', value: grades.average != null ? `${grades.average}%` : 'N/A', sub: `${grades.total ?? 0} graded assignments`, icon: FiAward, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Quiz Average', value: quizzes.average != null ? `${quizzes.average}%` : 'N/A', sub: `${quizzes.total ?? 0} quizzes taken`, icon: FiStar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Reports</h1>
          <p className="theme-text mt-1">Report card for {student?.name || 'your child'}</p>
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
          <div className="flex flex-col sm:flex-row gap-3 items-end justify-between">
            {students.length > 1 ? (
              <div className="w-full max-w-sm">
                <label className="block text-xs theme-text-muted font-medium mb-1.5">Student</label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} • Class {s.class} • Roll {s.rollNumber}</option>
                  ))}
                </select>
              </div>
            ) : <div />}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              <FiPrinter size={16} />
              Print Report
            </button>
          </div>

          {loadingData ? (
            <CardSkeleton />
          ) : (
            <Card className="p-6 lg:p-8">
              <div className="border-b theme-border pb-5 mb-6">
                <h2 className="text-card-title theme-text">Report Card</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm">
                  <p className="theme-text">{student?.name}</p>
                  <p className="theme-text-muted">Class {student?.class}</p>
                  <p className="theme-text-muted">Roll: {student?.rollNumber}</p>
                  {student?.email && <p className="theme-text-muted">{student.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {summaryCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-4 theme-subtle"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <card.icon size={16} className={card.color} />
                      <span className="text-xs theme-text-muted">{card.label}</span>
                    </div>
                    <p className="text-2xl font-bold theme-text">{card.value}</p>
                    <p className="text-xs theme-text-muted mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FiBookOpen size={18} className="text-indigo-500" />
                <h3 className="text-card-subtitle theme-text">Course Progress</h3>
              </div>
              {courses.length === 0 ? (
                <p className="text-sm theme-text-muted text-center py-6">No courses enrolled</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className="text-sm theme-text truncate">{course.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs theme-text-muted">{Math.round(course.progress || 0)}%</span>
                            {course.completed && <Badge color="emerald" size="sm" dot>Completed</Badge>}
                          </div>
                        </div>
                        <ProgressBar value={course.progress || 0} size="sm" color="indigo" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t theme-border flex items-center gap-2 text-xs theme-text-muted">
                <FiCheckCircle size={14} className="text-emerald-500" />
                Report generated on {new Date().toLocaleDateString()}
              </div>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
