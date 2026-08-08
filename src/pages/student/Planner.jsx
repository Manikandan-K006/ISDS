import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Calendar, Plus, Trash2, Sparkles, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, ProgressBar, SkeletonCard } from '../../components/ui';

const priorityColor = { high: 'rose', medium: 'amber', low: 'slate' };
const statusColor = { pending: 'amber', in_progress: 'indigo', completed: 'emerald', skipped: 'slate', rescheduled: 'blue' };
const statusLabel = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', skipped: 'Skipped', rescheduled: 'Rescheduled' };

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', subject: '', date: todayISO(), duration: '', priority: 'medium' });

  const load = useCallback(() => {
    API.get('/planner/tasks')
      .then(({ data }) => setTasks(data.tasks))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const createTask = async (payload, source) => {
    try {
      const { data } = await API.post('/planner/tasks', { ...payload, source });
      setTasks((prev) => [data.task, ...prev]);
      toast.success('Task added');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add task');
      return false;
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (await createTask(form, 'manual')) setShowModal(false);
  };

  const addSuggestion = async (task) => {
    const ok = await createTask({
      title: task.title,
      subject: task.subject,
      date: task.date ? task.date.slice(0, 10) : todayISO(),
      duration: task.duration,
      priority: task.priority,
    }, 'suggestion');
    if (ok) setSuggestions((prev) => prev.filter((s) => s.title !== task.title));
  };

  const patchStatus = async (id, status) => {
    const prev = tasks;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await API.patch(`/planner/tasks/${id}/status`, { status });
    } catch (err) {
      setTasks(prev);
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const removeTask = async (id) => {
    try {
      await API.delete(`/planner/tasks/${id}`);
      setTasks((list) => list.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const loadSuggestions = async () => {
    setShowSuggestions(true);
    API.get('/planner/suggestions')
      .then(({ data }) => setSuggestions(data.tasks))
      .catch((err) => toast.error(err.response?.data?.error || 'Could not load suggestions'));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const done = tasks.filter((t) => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Study Planner</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Study Planner</h1>
          <p className="text-caption theme-text-muted mt-1">
            {done}/{tasks.length} tasks completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadSuggestions} icon={Sparkles}>Suggestions</Button>
          <Button onClick={() => { setForm({ title: '', subject: '', date: todayISO(), duration: '', priority: 'medium' }); setShowModal(true); }} icon={Plus}>Add Task</Button>
        </div>
      </div>

      {tasks.length > 0 && (
        <Card className="p-4">
          <ProgressBar value={tasks.length ? (done / tasks.length) * 100 : 0} color="indigo" showLabel label={`${Math.round((done / tasks.length) * 100)}%`} />
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'in_progress', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-small font-medium capitalize transition-colors ${filter === s ? 'bg-[var(--primary)] text-white' : 'theme-text-muted hover:bg-[var(--hover)]'}`}
          >
            {s === 'all' ? 'All' : statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card><EmptyState icon={Calendar} title="No tasks here" description="Add a task or grab suggestions from your courses and quizzes." /></Card>
        )}
        {filtered.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start gap-3">
              <button onClick={() => patchStatus(t.id, t.status === 'completed' ? 'pending' : 'completed')} className={`mt-0.5 shrink-0 transition-colors ${t.status === 'completed' ? 'text-emerald-500' : 'theme-text-muted hover:text-[var(--primary)]'}`}>
                <CheckCircle2 size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-card-subtitle theme-text ${t.status === 'completed' ? 'line-through opacity-60' : ''}`}>{t.title}</span>
                  <Badge color={priorityColor[t.priority] || 'slate'} size="sm">{t.priority}</Badge>
                  {t.subject && <Badge color="indigo" size="sm">{t.subject}</Badge>}
                </div>
                {t.description && <p className="text-caption theme-text-muted mt-1">{t.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-small theme-text-muted flex-wrap">
                  <span className="inline-flex items-center gap-1"><Calendar size={13} /> {new Date(t.date).toLocaleDateString()}</span>
                  {t.duration && <span className="inline-flex items-center gap-1"><Clock size={13} /> {t.duration} min</span>}
                  <Badge color={statusColor[t.status]} size="sm" dot>{statusLabel[t.status]}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => removeTask(t.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <h2 className="text-card-title theme-text">New Task</h2>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Revise chapter 3" />
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Data Structures" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input type="number" label="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45" />
          </div>
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus}>Add Task</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showSuggestions} onClose={() => setShowSuggestions(false)} size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-card-title theme-text">Smart Suggestions</h2>
              <p className="text-caption theme-text-muted">Based on your upcoming assignments and available quizzes</p>
            </div>
            <button onClick={() => setShowSuggestions(false)} className="theme-text-muted hover:theme-text p-1"><ChevronDown size={18} /></button>
          </div>
          {suggestions.length === 0 ? (
            <EmptyState icon={Sparkles} title="Nothing to suggest" description="You're all caught up! No pending assignments or quizzes right now." />
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {suggestions.map((s, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-card-subtitle theme-text">{s.title}</span>
                        <Badge color={priorityColor[s.priority] || 'slate'} size="sm">{s.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-small theme-text-muted flex-wrap">
                        {s.subject && <span>{s.subject}</span>}
                        {s.date && <span className="inline-flex items-center gap-1"><Calendar size={13} /> {new Date(s.date).toISOString().slice(0, 10)}</span>}
                        {s.duration && <span className="inline-flex items-center gap-1"><Clock size={13} /> {s.duration} min</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => addSuggestion(s)} icon={Plus}>Add</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
