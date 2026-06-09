import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiAward, FiBookOpen, FiCalendar, FiTrendingUp, FiMail, FiPhone, FiStar } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useStudentData } from '../../hooks/useStudentData';
import { getInitials, formatDate } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/[0.06] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-white font-semibold">GPA: {payload[0].value}</p>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const StudentProfile = () => {
  const { user } = useAuth();
  const { student, trophies, certificates, loading, error } = useStudentData();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.parentContact || '',
    bio: 'Passionate learner | Math enthusiast',
  });

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

  if (!student) return null;

  const gpaData = student.gpaHistory?.length
    ? student.gpaHistory.map((gpa, i) => ({ term: `T${i + 1}`, gpa }))
    : (student.subjects || []).map((s, i) => ({
        term: s.name?.substring(0, 3) || `S${i + 1}`,
        gpa: +(s.score / 25).toFixed(2),
      }));

  const stats = [
    { icon: FiBookOpen, label: 'Total Courses', value: student.enrolledCourses?.length || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: FiAward, label: 'Certificates', value: certificates?.length || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: FiCalendar, label: 'Attendance', value: student.attendance ? `${student.attendance}%` : 'N/A', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: FiTrendingUp, label: 'Rank', value: student.rank || '--', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/[0.06] p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full -translate-y-36 translate-x-36 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-[3px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center">
              <span className="text-3xl text-indigo-400 font-bold">{getInitials(student.name)}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{student.name}</h1>
                <p className="text-slate-300 mt-1">
                  Class {student.class} &middot; Roll No. {student.rollNumber} &middot; {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                </p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                {editing ? <FiSave size={16} /> : <FiEdit2 size={16} />}
                {editing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {student.gpa}
            </div>
            <span className="text-xs text-slate-400">GPA</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400" /> Academic Performance
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="term" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis domain={[0, 4]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="gpa" stroke="#818CF8" strokeWidth={2} dot={{ fill: '#818CF8', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiStar className="text-amber-400" /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(student.subjects || []).map(s => {
              const color = s.score >= 90 ? 'emerald' : s.score >= 75 ? 'amber' : 'rose';
              const map = {
                emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
              };
              return (
                <div
                  key={s.name}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${map[color]}`}
                >
                  {s.name} - {s.score}%
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAward className="text-emerald-400" /> Achievements
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(trophies || []).map(t => (
              <div key={t._id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                <div className="text-2xl mb-1">{t.icon}</div>
                <p className="text-xs font-medium text-white">{t.title}</p>
                <p className="text-[10px] text-slate-500">{formatDate(t.earnedAt)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiBookOpen className="text-indigo-400" /> Certificates
          </h2>
          <div className="space-y-2">
            {(certificates || []).map(c => (
              <div key={c._id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FiAward className="text-emerald-400" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.courseName}</p>
                  <p className="text-xs text-slate-500">Grade {c.grade} &middot; {formatDate(c.issuedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <FiMail size={12} /> Email
            </label>
            {editing ? (
              <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            ) : (
              <p className="text-sm text-white">{student.email}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <FiPhone size={12} /> Parent Contact
            </label>
            {editing ? (
              <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            ) : (
              <p className="text-sm text-white">{student.parentContact}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <FiAward size={12} /> Credits
            </label>
            <p className="text-sm text-white">{student.credits} / {student.graduationCredits}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Bio</label>
            {editing ? (
              <input value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            ) : (
              <p className="text-sm text-white">{profile.bio}</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentProfile;
