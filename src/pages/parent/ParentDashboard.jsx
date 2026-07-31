import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { GraduationCap, CalendarCheck, BarChart3, ClipboardList } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/parents/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const students = data?.students || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-page-title theme-text">Welcome, {user?.name}</h1>
        <p className="theme-text-muted mt-1">Monitor your child's academic journey</p>
      </div>

      {students.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-lg font-semibold theme-text mb-2">No Students Linked</h2>
          <p className="theme-text-muted text-sm max-w-md mx-auto">
            No student profiles are linked to your parent account. Please contact the administration.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {students.map((student, idx) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="theme-card rounded-2xl p-6 card-shadow-premium"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-lg">
                  {student.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-card-title theme-text">{student.name}</h2>
                  <p className="text-sm theme-text-muted">Class {student.class} • Roll: {student.rollNumber}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-500/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarCheck size={16} className="text-indigo-500" />
                    <span className="text-xs theme-text-muted">Attendance</span>
                  </div>
                  <p className="text-2xl font-bold theme-text">{student.attendanceRate}%</p>
                </div>
                <div className="bg-emerald-500/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-emerald-500" />
                    <span className="text-xs theme-text-muted">Avg Score</span>
                  </div>
                  <p className="text-2xl font-bold theme-text">{student.avgScore}%</p>
                </div>
                <div className="bg-violet-500/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={16} className="text-violet-500" />
                    <span className="text-xs theme-text-muted">Courses</span>
                  </div>
                  <p className="text-2xl font-bold theme-text">{student.totalCourses}</p>
                </div>
                <div className="bg-amber-500/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={16} className="text-amber-500" />
                    <span className="text-xs theme-text-muted">Completed</span>
                  </div>
                  <p className="text-2xl font-bold theme-text">{student.completedAssignments}</p>
                </div>
              </div>

              {/* Enrolled Courses */}
              {student.enrollments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold theme-text mb-3">Enrolled Courses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <GraduationCap size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium theme-text truncate">{enrollment.course.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs theme-text-muted">{Math.round(enrollment.progress)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Grades */}
              {student.recentGrades?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold theme-text mb-3">Recent Grades</h3>
                  <div className="space-y-2">
                    {student.recentGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="text-sm theme-text">{grade.assignment.title}</p>
                          <p className="text-xs theme-text-muted">Max: {grade.assignment.maxMarks}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${grade.marks >= grade.assignment.maxMarks * 0.6 ? 'text-emerald-500' : 'text-red-400'}`}>
                            {grade.marks}/{grade.assignment.maxMarks}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}