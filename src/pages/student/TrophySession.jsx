import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiStar, FiTarget, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { MOCK_TROPHIES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const categories = [
  { key: 'all', label: 'All Badges', icon: FiAward },
  { key: 'academic', label: 'Academic', icon: FiTrendingUp },
  { key: 'attendance', label: 'Attendance', icon: FiStar },
  { key: 'achievement', label: 'Achievement', icon: FiTarget },
];

const badgeStyles = {
  academic: 'from-indigo-600/20 to-indigo-900/20 border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
  attendance: 'from-amber-600/20 to-amber-900/20 border-amber-500/20 hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  achievement: 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
};

const iconColors = {
  academic: 'text-indigo-300',
  attendance: 'text-amber-300',
  achievement: 'text-emerald-300',
};

const TrophySession = () => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? MOCK_TROPHIES
    : MOCK_TROPHIES.filter(t => t.badgeType === filter);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Achievement Gallery</h1>
          <p className="text-slate-400 mt-1">All your badges, trophies, and milestones</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <FiMapPin className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Class Rank</p>
            <p className="text-xl font-bold text-white">#3 / 42</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiAward className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Badges</p>
            <p className="text-xl font-bold text-white">{MOCK_TROPHIES.length}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === cat.key
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <cat.icon size={16} /> {cat.label}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((trophy, i) => (
              <motion.div
                key={trophy._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${badgeStyles[trophy.badgeType] || badgeStyles.academic} rounded-2xl p-5 border transition-all group cursor-pointer`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {trophy.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{trophy.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{trophy.description}</p>
                  <p className="text-xs text-slate-500">Earned {formatDate(trophy.earnedAt)}</p>
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
            <h3 className="text-lg font-medium text-white mb-1">No badges yet</h3>
            <p className="text-sm text-slate-400">Keep learning to earn more badges!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrophySession;
