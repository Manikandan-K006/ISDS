import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Calendar, BookOpen, RefreshCw, Sparkles, Clock, Target, ArrowRight } from 'lucide-react';

const TYPE_LABELS = {
  assignment: { label: 'Assignment', className: 'bg-amber-500/10 text-amber-400' },
  quiz: { label: 'Quiz', className: 'bg-sky-500/10 text-sky-400' },
  skill: { label: 'Skill', className: 'bg-violet-500/10 text-violet-400' },
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function StudyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/ai/study-plan');
      setPlan(data.plan);
    } catch {
      toast.error('Could not load your study plan');
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await API.post('/ai/study-plan/generate');
      setPlan(data.plan);
      toast.success('New study plan generated from your current workload');
    } catch {
      toast.error('Could not generate a plan right now');
    } finally {
      setGenerating(false);
    }
  };

  const days = plan?.schedule
    ? DAY_ORDER.filter((d) => Array.isArray(plan.schedule[d]) && plan.schedule[d].length)
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title theme-text">AI Study Plan</h1>
          <p className="text-sm theme-text-muted mt-1">
            A deterministic weekly schedule built from your real deadlines and weak areas.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:opacity-90 disabled:opacity-60 transition-all"
        >
          <Sparkles size={16} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating…' : 'Generate New Plan'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="theme-card rounded-2xl p-5 card-shadow space-y-3">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      ) : !plan?.schedule || !days.length ? (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-5">
            <BookOpen size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold theme-text mb-2">No study plan yet</h3>
          <p className="theme-text-muted text-sm mb-6 max-w-md mx-auto">
            Generate a personalized week that prioritizes pending assignments, unfinished quizzes and your weakest skills.
          </p>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
          >
            <Sparkles size={16} /> Generate My Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="theme-card rounded-2xl p-5 card-shadow border-l-4 border-indigo-500">
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={15} className="text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wide theme-text-muted">Short-term goal</span>
              </div>
              <p className="text-sm theme-text">{plan.goals?.shortTerm || 'Complete your top priority first'}</p>
            </div>
            <div className="theme-card rounded-2xl p-5 card-shadow border-l-4 border-violet-500">
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={15} className="text-violet-400" />
                <span className="text-xs font-semibold uppercase tracking-wide theme-text-muted">Long-term goal</span>
              </div>
              <p className="text-sm theme-text">{plan.goals?.longTerm || 'Close skill gaps and stay ahead'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day, di) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.06 }}
                className="theme-card rounded-2xl p-5 card-shadow"
              >
                <h3 className="text-sm font-semibold theme-text capitalize mb-3 flex items-center gap-2">
                  <Calendar size={14} className="theme-text-muted" />
                  {day}
                </h3>
                <div className="space-y-2">
                  {plan.schedule[day].map((task, i) => {
                    const meta = TYPE_LABELS[task.type] || { label: 'Task', className: 'bg-[var(--hover)] theme-text-muted' };
                    return (
                      <div key={i} className="p-3 rounded-xl theme-input border theme-border hover:theme-hover transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm theme-text font-medium">{task.task}</span>
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>{meta.label}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs theme-text-muted">
                          <span className="flex items-center gap-1"><Clock size={11} /> {task.time}</span>
                          {task.subject && <span>{task.subject}</span>}
                          <span className="flex items-center gap-1">
                            <ArrowRight size={11} /> ~{task.estimatedMinutes || 45} min
                          </span>
                          {task.priority === 'high' && <span className="text-amber-400 font-medium">High priority</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={loadPlan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl theme-input border theme-border text-sm theme-text-muted hover:theme-text hover:bg-[var(--hover)] transition-colors"
            >
              <RefreshCw size={14} /> Refresh plan
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
