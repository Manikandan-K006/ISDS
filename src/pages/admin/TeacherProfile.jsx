import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiUser, FiBookOpen, FiAward, FiBarChart2, FiStar } from 'react-icons/fi';
import { getCourses } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: user?.name || 'Teacher',
    email: user?.email || '',
    subject: 'General',
    phone: user?.parentContact || '',
    bio: 'Teacher at ISDS',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || 'Teacher',
        email: user.email || '',
        subject: 'General',
        phone: user.parentContact || '',
        bio: user.bio || 'Teacher at ISDS',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const teacherCourses = user?.name
    ? courses.filter(c => c.instructor && c.instructor.toLowerCase().includes(user.name.toLowerCase()))
    : [];

  const assignedClasses = [...new Set(courses.filter(c => c.assignedClasses).flatMap(c => c.assignedClasses || []))];

  const classPerformance = assignedClasses.map(cls => ({
    class: cls,
    avg: 0,
    students: courses.filter(c => (c.assignedClasses || []).includes(cls)).length,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="theme-bg rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
            <span className="text-2xl text-indigo-400 font-bold">{profile.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold theme-text">{profile.name}</h1>
            <p className="theme-text-muted">{profile.subject} Teacher</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg theme-subtle theme-text text-sm hover:theme-hover transition-colors">
            {editing ? <FiSave size={16} /> : <FiEdit2 size={16} />} {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="theme-card border theme-border rounded-xl p-5">
            <h2 className="text-sm font-semibold theme-text mb-3">Personal Info</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Subject', key: 'subject' },
                { label: 'Bio', key: 'bio' },
              ].map(f => (
                <div key={f.key}>
                  <span className="theme-text-muted text-xs">{f.label}</span>
                  {editing ? (
                    <input value={profile[f.key]} onChange={e => setProfile({...profile, [f.key]: e.target.value})}
                      className="w-full theme-input border theme-border rounded px-2 py-1 theme-text text-sm focus:outline-none focus:border-indigo-500/50 mt-0.5"
                    />
                  ) : (
                    <p className="theme-text mt-0.5">{profile[f.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="theme-card border theme-border rounded-xl p-5">
            <h2 className="text-sm font-semibold theme-text mb-3 flex items-center gap-2"><FiStar className="text-indigo-400" /> Assigned Classes</h2>
            <div className="flex flex-wrap gap-2">
              {assignedClasses.length > 0 ? assignedClasses.map(c => (
                <span key={c} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm border border-indigo-500/20">{c}</span>
              )) : <p className="text-xs theme-text-muted">No classes assigned</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="theme-card border theme-border rounded-xl p-5">
            <h2 className="text-sm font-semibold theme-text mb-3 flex items-center gap-2"><FiBarChart2 className="text-emerald-400" /> Class Performance</h2>
            <div className="space-y-3">
              {classPerformance.length > 0 ? classPerformance.map(c => (
                <div key={c.class} className="flex items-center justify-between p-3 rounded-lg theme-input">
                  <div>
                    <span className="text-sm theme-text">{c.class}</span>
                    <span className="text-xs theme-text-muted ml-2">{c.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 theme-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${c.avg}%` }} />
                    </div>
                    <span className="text-sm font-medium theme-text">{c.avg}%</span>
                  </div>
                </div>
              )) : <p className="text-xs theme-text-muted py-4 text-center">No performance data available</p>}
            </div>
          </div>

          <div className="theme-card border theme-border rounded-xl p-5">
            <h2 className="text-sm font-semibold theme-text mb-3 flex items-center gap-2"><FiBookOpen className="text-indigo-400" /> Courses</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : teacherCourses.length > 0 ? teacherCourses.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg hover:theme-input">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <FiBookOpen className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm theme-text">{c.title}</p>
                    <p className="text-xs theme-text-muted">{c.duration || c.difficulty || ''}</p>
                  </div>
                  <span className="text-xs theme-text-muted">{c.difficulty}</span>
                </div>
              )) : (
                <p className="text-xs theme-text-muted py-4 text-center">No courses found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
