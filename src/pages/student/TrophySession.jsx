import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTarget, FiTrendingUp, FiStar } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { formatDate } from '../../utils/helpers';
import { Card, Badge, Button } from '../../components/ui';
import { ListSkeleton } from '../../components/shared/LoadingSkeleton';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'academic', label: 'Academic' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'achievement', label: 'Achievement' },
];

const TrophySession = () => {
  const { trophies, loading, error } = useStudentData();
  const [filter, setFilter] = useState('all');

  if (loading) return <ListSkeleton count={3} />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  const filtered = filter === 'all'
    ? trophies
    : trophies.filter(t => t.badgeType === filter);

  const badgeColor = (type) => {
    const map = { academic: 'indigo', attendance: 'amber', achievement: 'emerald' };
    return map[type] || 'indigo';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text">Achievements</h1>
        <p className="text-sm theme-text-muted mt-1">{trophies.length} total</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat.key}
            variant={filter === cat.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(trophy => (
            <Card key={trophy._id} className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 text-2xl">
                  {trophy.icon}
                </div>
                <h3 className="text-sm font-semibold theme-text mb-1">{trophy.title}</h3>
                <p className="text-xs theme-text-muted mb-3 line-clamp-2">{trophy.description}</p>
                <Badge color={badgeColor(trophy.badgeType)}>
                  {trophy.badgeType}
                </Badge>
                <p className="text-xs theme-text-muted mt-2">Earned {formatDate(trophy.earnedAt)}</p>
              </div>
            </Card>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <FiAward className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-lg font-medium theme-text mb-1">No achievements yet</h3>
          <p className="text-sm theme-text-muted">Keep learning to earn more badges!</p>
        </Card>
      )}
    </div>
  );
};

export default TrophySession;
