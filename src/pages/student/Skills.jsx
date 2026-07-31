import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../../api/client';
import { Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, ProgressBar, Badge, SkeletonCard, EmptyState } from '../../components/ui';

const scoreColor = (score) => {
  if (score >= 75) return 'emerald';
  if (score >= 50) return 'indigo';
  if (score >= 30) return 'amber';
  return 'rose';
};

export default function Skills() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/skills')
      .then(({ data }) => {
        setData(data);
        const first = data?.skills?.find((s) => s.score > 0) || data?.skills?.[0];
        setSelected(first || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Skills</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const skills = data?.skills || [];
  const grouped = data?.grouped || {};
  const radarData = skills.filter((s) => s.score > 0).slice(0, 8).map((s) => ({ skill: s.name, score: s.score }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Skill Analysis</h1>
          <p className="text-caption theme-text-muted mt-1">Computed from your courses, quizzes, assignments, and projects</p>
        </div>
        <Badge color="indigo" size="lg"><Zap size={14} /> {skills.filter((s) => s.score > 0).length} skills active</Badge>
      </div>

      {skills.length === 0 ? (
        <Card><EmptyState icon={Zap} title="No skills yet" description="Complete courses and projects to build your skill profile." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([category, list]) => (
              <Card key={category} className="p-5">
                <h3 className="text-card-subtitle theme-text mb-4">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {list.map((s) => (
                    <button
                      key={s.id || s.name}
                      onClick={() => setSelected(s)}
                      className={`text-left rounded-xl p-2.5 transition-colors ${selected?.name === s.name ? 'bg-[var(--primary-muted)]' : 'hover:bg-[var(--hover)]'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-caption theme-text font-medium">{s.name}</span>
                        <span className="text-small theme-text-muted">{s.score}%</span>
                      </div>
                      <ProgressBar value={s.score} color={scoreColor(s.score)} size="sm" />
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            {radarData.length > 1 && (
              <Card className="p-5">
                <h3 className="text-card-subtitle theme-text mb-3">Top Skills</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {selected && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-card-subtitle theme-text">{selected.name}</h3>
                  <Badge color={scoreColor(selected.score)}>{selected.score}%</Badge>
                </div>
                <div className="space-y-3">
                  {selected.breakdown?.map((b) => (
                    <div key={b.type} className="flex items-center justify-between text-small">
                      <span className="theme-text-muted">{b.label} <span className="text-micro opacity-60">({b.detail})</span></span>
                      <span className="theme-text font-medium">{b.score}%</span>
                    </div>
                  ))}
                </div>
                {!selected.breakdown?.length && (
                  <p className="text-caption theme-text-muted">No evidence yet — enroll in matching courses or add projects.</p>
                )}
                <a href="/career" className="inline-flex items-center gap-1.5 mt-4 text-small text-[var(--primary)] hover:underline">
                  See career readiness <ArrowRight size={14} />
                </a>
              </Card>
            )}

            <Card className="p-5 bg-gradient-to-br from-[var(--primary)]/5 to-transparent border-[var(--primary)]/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[var(--primary)]" />
                <h3 className="text-card-subtitle theme-text">How it works</h3>
              </div>
              <p className="text-caption theme-text-muted leading-relaxed">
                Scores combine course progress, quiz scores, assignment grades, and project work for each skill, weighted 20/30/25/25.
              </p>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
