import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../../api/client';
import { Zap, TrendingUp, ArrowRight, Target, BookOpen, Wrench, Award, FlaskConical } from 'lucide-react';
import { Card, ProgressBar, Badge, SkeletonCard, EmptyState } from '../../components/ui';

const ROLES = [
  { key: 'full_stack_developer', label: 'Full Stack Developer' },
  { key: 'ai_engineer', label: 'AI Engineer' },
  { key: 'data_analyst', label: 'Data Analyst' },
  { key: 'software_engineer', label: 'Software Engineer' },
  { key: 'cybersecurity_analyst', label: 'Cybersecurity Analyst' },
];

const STATUS_BADGE = {
  ready: { label: 'Ready', className: 'bg-emerald-500/10 text-emerald-400' },
  close: { label: 'Almost there', className: 'bg-amber-500/10 text-amber-400' },
  'needs-work': { label: 'Needs work', className: 'bg-rose-500/10 text-rose-400' },
};

const gapColor = (gap) => (gap === 0 ? 'var(--success)' : gap < 20 ? 'var(--warning)' : 'var(--danger)');

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
  const [role, setRole] = useState('full_stack_developer');
  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    setGapLoading(true);
    API.get('/ai/skill-gap', { params: { role } })
      .then(({ data }) => { if (!cancelled) setGapData(data); })
      .catch(() => { if (!cancelled) setGapData(null); })
      .finally(() => { if (!cancelled) setGapLoading(false); });
    return () => { cancelled = true; };
  }, [role]);

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

      <Card className="p-5 bg-gradient-to-br from-[var(--primary)]/5 to-transparent border-[var(--primary)]/20">
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} className="text-[var(--primary)]" />
          <h3 className="text-card-subtitle theme-text">Skill Gap Analyzer</h3>
        </div>
        <p className="text-caption theme-text-muted mb-4">
          Pick a career role to see your readiness, the exact gaps, and a step-by-step roadmap to close them.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                role === r.key ? 'gradient-accent text-white shadow-md shadow-indigo-500/30' : 'theme-input border theme-border theme-text-muted hover:theme-text hover:bg-[var(--hover)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {gapLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : gapData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge color="indigo" size="lg">{gapData.role.label}</Badge>
                  <span className="text-xs theme-text-muted">Readiness</span>
                </div>
                <span className="text-2xl font-extrabold text-gradient">{gapData.overallProgress}%</span>
              </div>
              <div className="h-2 rounded bg-[var(--hover)] overflow-hidden mb-5">
                <div className="h-full gradient-accent rounded transition-all duration-500" style={{ width: `${gapData.overallProgress}%` }} />
              </div>
              <div className="space-y-3">
                {gapData.rows.map((row) => (
                  <div key={row.skill} className="p-3 rounded-xl theme-input border theme-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-caption theme-text font-medium">{row.skill}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[row.status].className}`}>
                        {STATUS_BADGE[row.status].label}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded bg-[var(--hover)] overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded theme-card border theme-border" style={{ width: `${Math.min(100, row.target)}%` }} />
                      <div className="absolute inset-y-0 left-0 rounded transition-all duration-500" style={{ width: `${row.current}%`, background: gapColor(row.gap) }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] theme-text-muted">
                      <span>You: {row.current}</span>
                      <span>Target: {row.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold theme-text mb-3">Recommended roadmap</h4>
              {gapData.recommended.length === 0 ? (
                <p className="text-caption theme-text-muted">You meet all targets for this role. Pick a harder role or start a new project!</p>
              ) : (
                <div className="space-y-4">
                  {gapData.recommended.slice(0, 3).map((g) => (
                    <div key={g.skill} className="theme-card border theme-border rounded-2xl p-4 card-shadow-premium">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-caption font-semibold theme-text">{g.skill}</span>
                        <span className="text-xs font-bold text-[var(--primary)]">+{g.gap} gap</span>
                      </div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-xs theme-text-secondary"><BookOpen size={13} className="shrink-0 mt-0.5 text-indigo-400" />{g.roadmap.courses}</li>
                        <li className="flex items-start gap-2 text-xs theme-text-secondary"><Wrench size={13} className="shrink-0 mt-0.5 text-emerald-400" />{g.roadmap.projects}</li>
                        <li className="flex items-start gap-2 text-xs theme-text-secondary"><FlaskConical size={13} className="shrink-0 mt-0.5 text-amber-400" />{g.roadmap.practice}</li>
                        {g.roadmap.certifications.slice(0, 2).map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs theme-text-secondary"><Award size={13} className="shrink-0 mt-0.5 text-violet-400" />{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-caption theme-text-muted">Could not load skill-gap data.</p>
        )}
      </Card>

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
