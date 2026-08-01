import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Mic, Send, CheckCircle2, AlertCircle, BarChart3, History, XCircle } from 'lucide-react';
import { Card, Button, Badge, ProgressBar, SkeletonCard } from '../../components/ui';

const levelColor = { basic: 'emerald', intermediate: 'amber', advanced: 'rose' };
const scoreColor = (s) => (s >= 70 ? 'emerald' : s >= 40 ? 'amber' : 'rose');

function RoleSelect({ roles, onStart, starting }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((r) => (
        <Card key={r.key} hover className="p-5 flex flex-col">
          <h3 className="text-card-subtitle theme-text">{r.label}</h3>
          <p className="text-caption theme-text-muted mt-1.5 flex-1">{r.description}</p>
          <Button className="mt-4" size="sm" onClick={() => onStart(r.key)} loading={starting === r.key} icon={Mic}>Start Practice</Button>
        </Card>
      ))}
    </div>
  );
}

function SessionView({ session, questions, onComplete, completing }) {
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(null);

  const saveAnswer = async (q, answer) => {
    if (!answer || answer.trim().length < 20) {
      toast.error('Answer must be at least 20 characters');
      return;
    }
    setSaving(q.id);
    try {
      const { data } = await API.post(`/interviews/sessions/${session.id}/answer`, { questionId: q.id, answer });
      setScores((prev) => ({ ...prev, [q.id]: data.evaluation.score }));
      setAnswers((prev) => ({ ...prev, [q.id]: answer }));
      toast.success(`Answered ${data.answered} of ${questions.length}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save answer');
    } finally {
      setSaving(null);
    }
  };

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge color={levelColor[q.level] || 'slate'}>{q.level}</Badge>
            <span className="text-small theme-text-muted">Question {current + 1} of {questions.length}</span>
          </div>
          <p className="text-card-title theme-text leading-relaxed">{q.question}</p>
          <p className="text-small theme-text-muted mt-2 inline-flex items-center gap-1.5"><BarChart3 size={13} /> {q.category}</p>
          <textarea
            rows={7}
            value={answers[q.id] || ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Type your answer (at least 20 characters)..."
            className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--primary)] transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</Button>
              {current < questions.length - 1 && <Button variant="secondary" size="sm" onClick={() => setCurrent(current + 1)}>Next</Button>}
            </div>
            <div className="flex items-center gap-2">
              {scores[q.id] != null && <Badge color={scoreColor(scores[q.id])}><CheckCircle2 size={12} /> {scores[q.id]}%</Badge>}
              <Button size="sm" onClick={() => saveAnswer(q, answers[q.id])} loading={saving === q.id} icon={Send}>Save & Score</Button>
            </div>
          </div>
        </Card>

        {answeredCount === questions.length && (
          <Button onClick={onComplete} loading={completing} icon={BarChart3} className="w-full">Complete Interview</Button>
        )}
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-card-subtitle theme-text mb-3">Progress</h3>
          <ProgressBar value={(answeredCount / questions.length) * 100} color="indigo" />
          <p className="text-caption theme-text-muted mt-2">{answeredCount} of {questions.length} answered</p>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            {questions.map((question, i) => (
              <button key={question.id} onClick={() => setCurrent(i)} className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${i === current ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--hover)]'}`}>
                <span className="text-small theme-text truncate">Q{i + 1}</span>
                {scores[question.id] != null ? (
                  <Badge color={scoreColor(scores[question.id])} size="sm">{scores[question.id]}%</Badge>
                ) : answers[question.id] ? (
                  <span className="text-amber-400"><AlertCircle size={14} /></span>
                ) : (
                  <span className="theme-text-muted"><XCircle size={14} /></span>
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryView({ summary, onDone }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={28} className="text-[var(--primary)]" />
        </div>
        <h2 className="text-card-title theme-text">Interview complete!</h2>
        <p className="text-page-title theme-text mt-2">{summary.score}%</p>
        <p className="text-caption theme-text-muted mt-1">overall score</p>
        <Button className="mt-5" onClick={onDone}>Back to Roles</Button>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-card-subtitle theme-text mb-3 text-emerald-500">Strengths</h3>
          <ul className="space-y-2">
            {summary.strengths?.length ? summary.strengths.map((s, i) => <li key={i} className="text-small theme-text-muted flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> {s}</li>) : <li className="text-small theme-text-muted">Keep practicing to build strengths.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-card-subtitle theme-text mb-3 text-amber-500">To improve</h3>
          <ul className="space-y-2">
            {summary.weakAreas?.length ? summary.weakAreas.map((s, i) => <li key={i} className="text-small theme-text-muted flex items-start gap-2"><AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" /> {s}</li>) : <li className="text-small theme-text-muted">Great coverage!</li>}
          </ul>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="text-card-subtitle theme-text mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {summary.recommendations?.length ? summary.recommendations.map((s, i) => <li key={i} className="text-small theme-text-muted flex items-start gap-2"><BarChart3 size={14} className="text-[var(--primary)] mt-0.5 shrink-0" /> {s}</li>) : null}
        </ul>
      </Card>
    </div>
  );
}

export default function Interviews() {
  const [roles, setRoles] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [starting, setStarting] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get('/interviews/roles').then(({ data }) => setRoles(data.roles)).catch(() => {});
    API.get('/interviews/sessions').then(({ data }) => setSessions(data.sessions)).catch(() => {});
  }, []);

  const startSession = async (role) => {
    setStarting(role);
    try {
      const { data } = await API.post('/interviews/sessions', { role });
      setActive(data.session);
      setQuestions(data.questions);
      setSummary(null);
      toast.success(`Session started — ${data.totalQuestions} questions`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start session');
    } finally {
      setStarting(null);
    }
  };

  const completeSession = async () => {
    setCompleting(true);
    try {
      const { data } = await API.post(`/interviews/sessions/${active.id}/complete`);
      setSummary(data.summary);
      setSessions((prev) => [...prev, { ...active, score: data.summary.score, status: 'completed' }]);
      toast.success('Interview completed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not complete session');
    } finally {
      setCompleting(false);
    }
  };

  if (!roles) return <div className="space-y-6"><h1 className="text-page-title theme-text">Mock Interview</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Mic size={20} className="text-[var(--primary)]" /></div>
        <div>
          <h1 className="text-page-title theme-text">Mock Interview</h1>
          <p className="text-caption theme-text-muted mt-0.5">Practice answering real interview questions with instant feedback</p>
        </div>
      </div>

      {summary ? (
        <SummaryView summary={summary} onDone={() => { setActive(null); setQuestions([]); setSummary(null); }} />
      ) : active ? (
        <SessionView session={active} questions={questions} onComplete={completeSession} completing={completing} />
      ) : (
        <>
          <RoleSelect roles={roles} onStart={startSession} starting={starting} />
          {sessions.length > 0 && (
            <div>
              <h2 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><History size={15} /> Past sessions</h2>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <Card key={s.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-small theme-text font-medium capitalize">{s.role}</p>
                      <p className="text-caption theme-text-muted">{new Date(s.createdAt).toLocaleDateString()} · {s.answers ? JSON.parse(s.answers || '[]').length : 0} answered</p>
                    </div>
                    {s.status === 'completed' && s.score != null ? <Badge color={scoreColor(s.score)}>{s.score}%</Badge> : <Badge color="amber">in progress</Badge>}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
