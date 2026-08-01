import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Code2, Terminal, ChevronLeft, CheckCircle2, XCircle, Clock, Play, FileCode2, Award } from 'lucide-react';
import { Card, Button, Badge, EmptyState, Select, SkeletonCard } from '../../components/ui';

const diffColor = { beginner: 'emerald', intermediate: 'amber', advanced: 'rose' };

const DEFAULT_STARTER = {
  javascript: '// Write your solution here\nfunction solve(input) {\n  return input;\n}\n',
  python: '# Write your solution here\ndef solve(input):\n    return input\n',
};

export default function Coding() {
  const [problems, setProblems] = useState(null);
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [config, setConfig] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);

  const loadList = useCallback(() => {
    API.get('/coding/problems')
      .then(({ data }) => setProblems(data.problems))
      .catch(() => {});
    API.get('/coding/config').then(({ data }) => setConfig(data)).catch(() => {});
    API.get('/coding/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
    API.get('/coding/submissions/me').then(({ data }) => setSubmissions(data.submissions)).catch(() => {});
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const openProblem = async (p) => {
    setActive(p);
    setResult(null);
    try {
      const { data } = await API.get(`/coding/problems/${p.id}`);
      setDetail(data.problem);
      const starters = data.problem.starterCode || {};
      setCode(starters[language] || DEFAULT_STARTER[language] || '// Write your solution here\n');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not open problem');
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    const starters = detail?.starterCode || {};
    setCode(starters[lang] || DEFAULT_STARTER[lang] || '// Write your solution here\n');
  };

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await API.post(`/coding/problems/${active.id}/submit`, { language, code });
      setResult(data);
      toast.success(data.execution?.enabled ? data.message : 'Solution saved');
      loadList();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problems) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Coding Lab</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  if (active) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActive(null); setDetail(null); }} className="p-2 rounded-xl theme-text-muted hover:bg-[var(--hover)]"><ChevronLeft size={18} /></button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-page-title theme-text truncate">{detail?.title || active.title}</h1>
              <Badge color={diffColor[detail?.difficulty] || 'slate'}>{detail?.difficulty}</Badge>
            </div>
            <div className="flex items-center gap-3 text-small theme-text-muted mt-0.5 flex-wrap">
              {(detail?.topics || []).map((t) => <Badge key={t} color="indigo" size="sm">{t}</Badge>)}
              <span>{detail?._count?.submissions ?? active._count?.submissions} submissions</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 max-h-[70vh] overflow-y-auto">
            <h3 className="text-card-subtitle theme-text mb-3">Problem</h3>
            <p className="text-caption theme-text leading-relaxed whitespace-pre-wrap">{detail?.description}</p>
            {detail?.constraints && <p className="text-small theme-text-muted mt-3 whitespace-pre-wrap"><span className="theme-text font-medium">Constraints:</span> {detail.constraints}</p>}
            {(detail?.examples || []).length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-micro theme-text-muted uppercase tracking-wide">Examples</h4>
                {detail.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-[var(--hover)] p-3.5 font-mono text-small space-y-1">
                    <p className="theme-text">Input: {ex.input}</p>
                    <p className="theme-text">Output: {ex.output}</p>
                    {ex.explanation && <p className="theme-text-muted">Explanation: {ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 size={16} className="text-[var(--primary)]" />
                  <span className="text-card-subtitle theme-text">Solution</span>
                </div>
                <Select value={language} onChange={(e) => changeLanguage(e.target.value)} options={[{ value: 'javascript', label: 'JavaScript' }, { value: 'python', label: 'Python' }]} className="w-36" />
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text font-mono outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-small theme-text-muted">
                  <Clock size={14} />
                  {config?.executionEnabled ? 'Live execution enabled' : 'Execution not configured — solution will be saved'}
                </div>
                <Button onClick={submit} loading={submitting} icon={Play}>Submit</Button>
              </div>
            </Card>

            {result && (
              <Card className={`p-4 ${result.submission?.status === 'executed' ? 'border-emerald-500/30' : ''}`}>
                <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><Terminal size={15} className="text-[var(--primary)]" /> Result</h3>
                {result.execution?.enabled ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {result.submission?.status === 'executed' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                      <span className="text-small theme-text">Passed {result.submission?.passedTests ?? 0}/{result.submission?.totalTests ?? 0} tests</span>
                    </div>
                    {result.submission?.accuracy != null && <p className="text-small theme-text-muted">Accuracy: {Math.round(result.submission.accuracy)}%</p>}
                    {result.submission?.output && <pre className="rounded-xl bg-[var(--hover)] p-3 font-mono text-small theme-text overflow-x-auto whitespace-pre-wrap">{result.submission.output}</pre>}
                    {result.submission?.error && <pre className="rounded-xl bg-red-500/10 p-3 font-mono text-small text-red-400 overflow-x-auto whitespace-pre-wrap">{result.submission.error}</pre>}
                  </div>
                ) : (
                  <p className="text-caption theme-text-muted">{result.message}</p>
                )}
              </Card>
            )}

            {submissions.filter((s) => s.problemId === active.id).length > 0 && (
              <Card className="p-4">
                <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><Award size={15} className="text-[var(--primary)]" /> My submissions</h3>
                <div className="space-y-2">
                  {submissions.filter((s) => s.problemId === active.id).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-[var(--hover)] px-3 py-2">
                      <span className="text-small theme-text-muted">{new Date(s.submittedAt).toLocaleString()}</span>
                      <span className="text-small theme-text">{s.status === 'executed' ? `${s.passedTests}/${s.totalTests} passed` : 'Saved'}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Coding Lab</h1>
          <p className="text-caption theme-text-muted mt-1">Practice problems to sharpen your programming skills</p>
        </div>
        {stats && (
          <div className="flex gap-2">
            <Badge color="indigo"><Code2 size={13} /> {stats.problems} problems</Badge>
            <Badge color="emerald"><CheckCircle2 size={13} /> {stats.total} submissions</Badge>
          </div>
        )}
      </div>

      {problems.length === 0 ? (
        <Card><EmptyState icon={Code2} title="No problems yet" description="Teachers can add problems from the teacher portal." /></Card>
      ) : (
        <div className="space-y-3">
          {problems.map((p) => (
            <Card key={p.id} hover className="p-4 cursor-pointer" onClick={() => openProblem(p)}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-card-subtitle theme-text">{p.title}</h3>
                  <p className="text-caption theme-text-muted mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={diffColor[p.difficulty] || 'slate'}>{p.difficulty}</Badge>
                  <span className="text-small theme-text-muted">{p._count?.submissions} submissions</span>
                </div>
              </div>
              {(p.topics || []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2.5">{p.topics.slice(0, 4).map((t) => <Badge key={t} color="indigo" size="sm">{t}</Badge>)}</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
