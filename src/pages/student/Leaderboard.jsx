import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const leaderboardData = [
  { rank: 1, name: 'Arjun Sharma', class: '10A', score: 98, avatar: 'AS', trend: 'up' },
  { rank: 2, name: 'Priya Verma', class: '10B', score: 95, avatar: 'PV', trend: 'up' },
  { rank: 3, name: 'Rahul Kumar', class: '10B', score: 92, avatar: 'RK', trend: 'stable' },
  { rank: 4, name: 'Sneha Patel', class: '10A', score: 89, avatar: 'SP', trend: 'up' },
  { rank: 5, name: 'Amit Singh', class: '10A', score: 87, avatar: 'AS', trend: 'down' },
  { rank: 6, name: 'Neha Gupta', class: '10B', score: 85, avatar: 'NG', trend: 'up' },
  { rank: 7, name: 'Vikram Joshi', class: '9A', score: 83, avatar: 'VJ', trend: 'stable' },
  { rank: 8, name: 'Ananya Reddy', class: '9B', score: 80, avatar: 'AR', trend: 'down' },
  { rank: 9, name: 'Karan Mehta', class: '9A', score: 78, avatar: 'KM', trend: 'up' },
  { rank: 10, name: 'Divya Nair', class: '9B', score: 75, avatar: 'DN', trend: 'stable' },
];

const CLASSES = ['All', '10A', '10B', '9A', '9B'];

const podiumGradients = {
  1: 'from-yellow-400 via-yellow-500 to-yellow-600',
  2: 'from-slate-300 via-slate-400 to-slate-500',
  3: 'from-amber-600 via-amber-700 to-amber-800',
};

const podiumBg = {
  1: 'bg-gradient-to-b from-yellow-400/20 via-yellow-500/10 to-transparent',
  2: 'bg-gradient-to-b from-slate-300/20 via-slate-400/10 to-transparent',
  3: 'bg-gradient-to-b from-amber-600/20 via-amber-700/10 to-transparent',
};

const podiumBorder = {
  1: 'border-yellow-500/30',
  2: 'border-slate-400/30',
  3: 'border-amber-700/30',
};

const PodiumCard = ({ student, index }) => {
  const positions = ['order-2', 'order-1', 'order-3'];
  const medalIcons = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };
  const heights = ['h-48', 'h-40', 'h-32'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6, ease: 'easeOut' }}
      className={`${positions[index]} flex flex-col items-center`}
    >
      <div className="text-3xl mb-2">{medalIcons[student.rank]}</div>
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${podiumGradients[student.rank]} p-[2px] mb-3`}
      >
        <div className="w-full h-full rounded-full theme-bg flex items-center justify-center">
          <span className="text-lg font-bold theme-text">{student.avatar}</span>
        </div>
      </div>
      <p className="text-sm font-semibold theme-text text-center">{student.name}</p>
      <p className="text-xs theme-text-muted">{student.class}</p>
      <div className={`mt-2 px-4 py-1 rounded-full ${podiumBg[student.rank]} border ${podiumBorder[student.rank]}`}>
        <span className="text-lg font-bold theme-text">{student.score}</span>
      </div>
      <div className={`w-full max-w-[120px] ${heights[index]} mt-2 rounded-t-xl ${podiumBg[student.rank]} border-l border-r border-t ${podiumBorder[student.rank]} flex items-end justify-center pb-2`}>
        <span className="text-2xl font-bold theme-text/80">#{student.rank}</span>
      </div>
    </motion.div>
  );
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <FiTrendingUp className="text-emerald-400" size={16} />;
  if (trend === 'down') return <FiTrendingDown className="text-rose-400" size={16} />;
  return <FiMinus className="theme-text-muted" size={16} />;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeClass, setActiveClass] = useState('All');

  const filtered = activeClass === 'All'
    ? leaderboardData
    : leaderboardData.filter(s => s.class === activeClass);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card rounded-2xl p-6 lg:p-8 border theme-border"
      >
        <h1 className="text-2xl lg:text-3xl font-bold theme-text">Leaderboard</h1>
        <p className="theme-text-muted mt-1">Top performers this semester</p>
      </motion.div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FiFilter className="theme-text-muted shrink-0" size={16} />
        {CLASSES.map(cls => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeClass === cls
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'theme-subtle theme-text-muted border theme-border hover:bg-[var(--hover)]'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 md:gap-8 px-4">
          {top3.map((student, i) => (
            <PodiumCard key={student.rank} student={student} index={i} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="theme-card rounded-2xl border theme-border overflow-hidden"
      >
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b theme-border text-xs theme-text-muted uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-2">Class</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-1 text-right">Trend</div>
        </div>
        {rest.map((student, i) => {
          const isCurrentUser = student.name === user?.name;
          return (
            <motion.div
              key={student.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.04, duration: 0.3 }}
              className={`grid grid-cols-12 gap-4 items-center px-6 py-4 border-b theme-border last:border-0 transition-colors ${
                isCurrentUser ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="col-span-1">
                <span className="text-sm font-mono theme-text-muted">#{student.rank}</span>
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                  {student.avatar}
                </div>
                <span className={`text-sm font-medium ${isCurrentUser ? 'text-indigo-300' : 'theme-text'}`}>
                  {student.name}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs theme-text-muted">{student.class}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold theme-text">{student.score}</span>
              </div>
              <div className="col-span-1 flex justify-end">
                <TrendIcon trend={student.trend} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
