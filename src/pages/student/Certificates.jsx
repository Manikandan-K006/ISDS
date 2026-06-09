import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiSearch, FiDownload, FiX, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import { MOCK_CERTIFICATES, MOCK_COURSES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const FILTERS = ['All', 'Academic', 'Co-curricular'];
const courseDomainMap = Object.fromEntries(MOCK_COURSES.map(c => [c.title, c.domain]));

const getCategory = (courseName) => {
  const domain = courseDomainMap[courseName] || '';
  const coCurricularDomains = ['Music', 'Physical Education', 'Co-curricular'];
  return coCurricularDomains.includes(domain) ? 'co-curricular' : 'academic';
};

const Certificates = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const totalCredits = MOCK_CERTIFICATES.reduce((sum, c) => sum + (c.creditPoints || 0), 0);

  const filtered = MOCK_CERTIFICATES.filter(cert => {
    const matchesSearch = cert.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || getCategory(cert.courseName) === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06]"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Certificates</h1>
        <p className="text-slate-400 mt-1">Your earned certificates and achievements</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A] rounded-2xl p-5 border border-white/[0.06] flex items-center gap-4 flex-1"
        >
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiAward className="text-emerald-400" size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Credits Earned</p>
            <p className="text-2xl font-bold text-emerald-400">{totalCredits}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A] rounded-2xl p-5 border border-white/[0.06] flex items-center gap-3 flex-1"
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search certificates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === f
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((cert, i) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 hover:border-emerald-500/20 transition-all group cursor-pointer"
                onClick={() => setSelected(cert)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiFileText className="text-emerald-400" size={24} />
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); }}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/[0.08]"
                  >
                    <FiDownload className="text-slate-400" size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">{cert.courseName}</h3>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={12} />
                    <span>Issued {formatDate(cert.issuedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAward size={12} />
                    <span>Grade: <span className="text-emerald-400 font-medium">{cert.grade}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser size={12} />
                    <span>{cert.instructor}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-12 text-center"
          >
            <FiAward className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-1">No certificates found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Certificate Details</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                >
                  <FiX className="text-slate-400" size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <FiFileText className="text-emerald-400" size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold">{selected.courseName}</h3>
                  <p className="text-sm text-slate-400 mt-1">Certificate of Completion</p>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Issue Date</span>
                    <span className="text-white">{formatDate(selected.issuedAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Grade Achieved</span>
                    <span className="text-emerald-400 font-medium">{selected.grade}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Instructor</span>
                    <span className="text-white">{selected.instructor}</span>
                  </div>
                  {selected.creditPoints > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Credit Points</span>
                      <span className="text-white">{selected.creditPoints}</span>
                    </div>
                  )}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
                  <FiDownload size={16} /> Download Certificate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Certificates;
