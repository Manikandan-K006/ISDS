import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTarget, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { MOCK_TROPHIES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const categories = [
  { key: 'all', label: 'All', icon: FiAward },
  { key: 'academic', label: 'Academic', icon: FiTrendingUp },
  { key: 'attendance', label: 'Attendance', icon: FiStar },
  { key: 'achievement', label: 'Achievements', icon: FiTarget },
];

const TrophySession = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? MOCK_TROPHIES : MOCK_TROPHIES.filter(t => t.badgeType === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Your Achievement Hall</h1>
          <p className="text-slate-300 mt-1">All your badges, trophies, and milestones</p>
        </div>
      </motion.div>

      <div className="glass rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <FiMapPin className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Class Rank</p>
            <p className="text-xl font-bold text-white">#3 / 42</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <FiAward className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Badges</p>
            <p className="text-xl font-bold text-white">{MOCK_TROPHIES.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setFilter(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === cat.key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <cat.icon size={16} /> {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((trophy, i) => (
          <motion.div
            key={trophy._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5 border border-white/10 hover:border-amber-500/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{trophy.icon}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{trophy.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{trophy.description}</p>
                <p className="text-xs text-slate-500 mt-2">Earned {formatDate(trophy.earnedAt)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-indigo-400" /> Milestone Timeline
        </h2>
        <div className="space-y-4">
          {[...MOCK_TROPHIES].reverse().map((t, i) => (
            <div key={t._id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500/50" />
                {i < MOCK_TROPHIES.length - 1 && <div className="w-px flex-1 bg-white/10" />}
              </div>
              <div className="pb-4">
                <p className="text-sm text-white">{t.title}</p>
                <p className="text-xs text-slate-500">{formatDate(t.earnedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrophySession;
