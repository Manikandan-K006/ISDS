import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEdit2, FiSave, FiAward, FiActivity, FiCalendar } from 'react-icons/fi';
import GradeTrendLine from '../../components/charts/GradeTrendLine';
import PerformanceRadar from '../../components/charts/PerformanceRadar';
import { MOCK_STUDENT } from '../../utils/constants';

const StudentProfile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: MOCK_STUDENT.name, email: MOCK_STUDENT.email,
    phone: MOCK_STUDENT.parentContact, bio: 'Passionate learner | Math enthusiast'
  });

  const gpaData = MOCK_STUDENT.gpaHistory.map((gpa, i) => ({ term: `T${i + 1}`, gpa }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
            <span className="text-3xl text-indigo-400 font-bold">AS</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{MOCK_STUDENT.name}</h1>
            <p className="text-slate-300">Class {MOCK_STUDENT.class} · Roll No. {MOCK_STUDENT.rollNumber}</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            {editing ? <FiSave size={16} /> : <FiEdit2 size={16} />}
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name' },
                { label: 'Email', key: 'email' },
                { label: 'Parent Contact', key: 'phone' },
                { label: 'Bio', key: 'bio', full: true },
              ].map(field => (
                <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs text-slate-400 mb-1">{field.label}</label>
                  {editing ? (
                    <input value={profile[field.key]} onChange={e => setProfile({...profile, [field.key]: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  ) : (
                    <p className="text-sm text-white">{profile[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiActivity className="text-indigo-400" /> GPA Trend
            </h2>
            <GradeTrendLine data={gpaData} />
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
            <PerformanceRadar />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiAward className="text-emerald-400" /> Credit Points
            </h2>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-emerald-400">{MOCK_STUDENT.credits}</div>
              <div className="text-xs text-slate-500">of {MOCK_STUDENT.graduationCredits} needed</div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full gradient-success rounded-full" style={{ width: `${(MOCK_STUDENT.credits / MOCK_STUDENT.graduationCredits) * 100}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">{Math.round((MOCK_STUDENT.credits / MOCK_STUDENT.graduationCredits) * 100)}% toward graduation</p>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiUser className="text-indigo-400" /> Subjects
            </h2>
            <div className="space-y-2">
              {MOCK_STUDENT.subjects.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{s.name}</span>
                  <span className={`text-xs font-medium ${s.score >= 90 ? 'text-emerald-400' : s.score >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {s.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiCalendar className="text-indigo-400" /> Quick Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Attendance</span><span className="text-white">{MOCK_STUDENT.attendance}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">GPA</span><span className="text-white">{MOCK_STUDENT.gpa}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Courses</span><span className="text-white">{MOCK_STUDENT.enrolledCourses.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
