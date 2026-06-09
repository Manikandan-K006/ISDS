import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiUser, FiBookOpen, FiAward, FiBarChart2, FiStar } from 'react-icons/fi';
import { getCourses } from '../../api/courses';

const TeacherProfile = () => {
  const [editing, setEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: 'Dr. Amit Verma', email: 'verma@school.com', subject: 'Mathematics',
    phone: '+91 98765 43200', bio: 'Senior Mathematics teacher with 12 years of experience'
  });

  const assignedClasses = ['10A', '10B', '9A'];

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

  const teacherCourses = courses.filter(c => (c.instructor && (c.instructor.includes('Dr.') || c.instructor.includes('Prof.'))));

  const classPerformance = [
    { class: '10A', avg: 82, students: 42 },
    { class: '10B', avg: 76, students: 38 },
    { class: '9A', avg: 85, students: 40 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
            <span className="text-2xl text-indigo-400 font-bold">AV</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-slate-300">{profile.subject} Teacher</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            {editing ? <FiSave size={16} /> : <FiEdit2 size={16} />} {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Personal Info</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Subject', key: 'subject' },
                { label: 'Bio', key: 'bio' },
              ].map(f => (
                <div key={f.key}>
                  <span className="text-slate-400 text-xs">{f.label}</span>
                  {editing ? (
                    <input value={profile[f.key]} onChange={e => setProfile({...profile, [f.key]: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-500/50 mt-0.5"
                    />
                  ) : (
                    <p className="text-white mt-0.5">{profile[f.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FiStar className="text-indigo-400" /> Assigned Classes</h2>
            <div className="flex flex-wrap gap-2">
              {assignedClasses.map(c => (
                <span key={c} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm border border-indigo-500/20">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FiBarChart2 className="text-emerald-400" /> Class Performance</h2>
            <div className="space-y-3">
              {classPerformance.map(c => (
                <div key={c.class} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <span className="text-sm text-white">{c.class}</span>
                    <span className="text-xs text-slate-500 ml-2">{c.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full gradient-accent rounded-full" style={{ width: `${c.avg}%` }} />
                    </div>
                    <span className="text-sm font-medium text-white">{c.avg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FiBookOpen className="text-indigo-400" /> Professional Development Courses</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : teacherCourses.slice(0, 3).map(c => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <FiBookOpen className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.duration}</p>
                  </div>
                  <span className="text-xs text-slate-400">{c.difficulty}</span>
                </div>
              ))}
              {!loading && teacherCourses.length === 0 && (
                <p className="text-xs text-slate-500">No professional development courses found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
