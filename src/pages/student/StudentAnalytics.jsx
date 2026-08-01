import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import API from '../../api/client';
import { BarChart3, CalendarCheck, ClipboardList, GraduationCap, Target } from 'lucide-react';
import { SkeletonCard } from '../../components/ui';

const tooltipStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 12 };

const percentage = (v) => Math.round(v * 10) / 10;

export default function StudentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/analytics')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">My Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const attendance = data?.attendanceTrend || [];
  const quizzes = data?.quizPerformance || [];
  const courses = data?.courseProgress || [];
  const grades = data?.assignmentGrades || [];

  const attRate = attendance.length
    ? Math.round((attendance.filter((a) => a.status === 'present' || a.status === 'late').length / attendance.length) * 100)
    : 0;
  const avgQuiz = quizzes.length ? percentage(quizzes.reduce((s, q) => s + q.percentage, 0) / quizzes.length) : 0;
  const avgGrade = grades.length
    ? percentage(grades.reduce((s, g) => s + (g.assignment.maxMarks > 0 ? (g.marks / g.assignment.maxMarks) * 100 : 0), 0) / grades.length)
    : 0;
  const completedCourses = courses.filter((c) => c.isCompleted).length;

  const attendanceChart = attendance.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    present: a.status === 'present' || a.status === 'late' ? 100 : 0,
  }));

  const quizChart = quizzes.map((q) => ({
    name: q.quiz?.title || 'Quiz',
    score: q.percentage,
  }));

  const gradeChart = grades.slice(0, 10).map((g) => ({
    name: g.assignment.title,
    pct: g.assignment.maxMarks > 0 ? percentage((g.marks / g.assignment.maxMarks) * 100) : 0,
  }));

  const statCards = [
    { icon: CalendarCheck, label: 'Attendance (30 days)', value: `${attRate}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Target, label: 'Avg Quiz Score', value: `${avgQuiz}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: ClipboardList, label: 'Avg Assignment', value: `${avgGrade}%`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: GraduationCap, label: 'Courses Completed', value: `${completedCourses}/${courses.length}`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">My Analytics</h1>
          <p className="text-sm theme-text-muted mt-1">Attendance, quiz performance, course progress and grades at a glance.</p>
        </div>
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
          <BarChart3 className="text-white" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div className="text-2xl font-extrabold theme-text">{s.value}</div>
            <div className="text-xs theme-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="theme-card border theme-border rounded-2xl p-5">
          <h3 className="text-card-subtitle theme-text mb-4">Attendance Trend</h3>
          {attendanceChart.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceChart}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="present" name="Present %" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm theme-text-muted py-8 text-center">No attendance records in the last 30 days.</p>
          )}
        </div>

        <div className="theme-card border theme-border rounded-2xl p-5">
          <h3 className="text-card-subtitle theme-text mb-4">Quiz Performance</h3>
          {quizChart.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizChart}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="score" name="Score %">
                    {quizChart.map((q, i) => (
                      <Cell key={i} fill={q.score >= 60 ? 'var(--success)' : q.score >= 40 ? 'var(--warning)' : 'var(--danger)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm theme-text-muted py-8 text-center">No quiz attempts yet.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="theme-card border theme-border rounded-2xl p-5">
          <h3 className="text-card-subtitle theme-text mb-4">Course Progress</h3>
          {courses.length ? (
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="theme-text">{c.course.title}</span>
                    <span className={`text-xs font-semibold ${c.isCompleted ? 'text-emerald-400' : 'theme-text-muted'}`}>
                      {c.isCompleted ? 'Completed' : `${Math.round(c.progress)}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded bg-[var(--hover)] overflow-hidden">
                    <div className="h-full gradient-accent rounded" style={{ width: `${Math.min(100, c.progress)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm theme-text-muted py-8 text-center">No enrollments yet.</p>
          )}
        </div>

        <div className="theme-card border theme-border rounded-2xl p-5">
          <h3 className="text-card-subtitle theme-text mb-4">Assignment Grades</h3>
          {gradeChart.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeChart}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                  <Bar dataKey="pct" name="Grade %" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm theme-text-muted py-8 text-center">No graded assignments yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
