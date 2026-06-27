import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiSearch, FiX, FiCheck, FiAlertTriangle, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { getCertificates, issueCertificate, revokeCertificate } from '../../api/certificates';
import { getStudents } from '../../api/students';
import { getCourses } from '../../api/courses';
import { Card, Input, Button, Badge } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ studentId: '', studentName: '', courseId: '', courseName: '', grade: 'A', issueDate: new Date().toISOString().split('T')[0] });
  const [issuing, setIssuing] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getCertificates(), getStudents(), getCourses(),
    ]);
    if (results[0].status === 'fulfilled') setCertificates(results[0].value);
    if (results[1].status === 'fulfilled') setStudents(results[1].value);
    if (results[2].status === 'fulfilled') setCourses(results[2].value);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleIssue = async () => {
    if (!issueForm.studentId || !issueForm.courseId) return toast.error('Select student and course');
    setIssuing(true);
    try {
      await issueCertificate(issueForm);
      toast.success('Certificate issued');
      setShowIssue(false);
      setIssueForm({ studentId: '', studentName: '', courseId: '', courseName: '', grade: 'A', issueDate: new Date().toISOString().split('T')[0] });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue');
    }
    setIssuing(false);
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate?')) return;
    try {
      await revokeCertificate(id);
      toast.success('Certificate revoked');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to revoke');
    }
  };

  const filtered = certificates.filter(c =>
    c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text">Certificates</h1>
          <p className="text-sm theme-text-muted mt-1">Issue & manage certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={FiRefreshCw} variant="ghost" size="sm" onClick={fetchAll} />
          <Button icon={FiAward} onClick={() => setShowIssue(true)}>Issue Certificate</Button>
        </div>
      </div>

      <Input icon={FiSearch} placeholder="Search by student, course, or certificate ID..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" />

      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b theme-border">
                <th className="text-left py-3 px-3 theme-text-muted font-medium text-xs">Certificate ID</th>
                <th className="text-left py-3 px-3 theme-text-muted font-medium text-xs">Student</th>
                <th className="text-left py-3 px-3 theme-text-muted font-medium text-xs">Course</th>
                <th className="text-center py-3 px-3 theme-text-muted font-medium text-xs">Grade</th>
                <th className="text-center py-3 px-3 theme-text-muted font-medium text-xs">Issued</th>
                <th className="text-center py-3 px-3 theme-text-muted font-medium text-xs">Status</th>
                <th className="text-center py-3 px-3 theme-text-muted font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b theme-border-light hover:theme-hover transition-colors">
                  <td className="py-3 px-3">
                    <code className="text-xs font-mono theme-text-muted">{c.certificateId}</code>
                  </td>
                  <td className="py-3 px-3 theme-text font-medium">{c.studentName}</td>
                  <td className="py-3 px-3 theme-text-muted">{c.courseName}</td>
                  <td className="text-center py-3 px-3"><Badge color={c.grade === 'A' || c.grade === 'A+' ? 'emerald' : 'indigo'}>{c.grade}</Badge></td>
                  <td className="text-center py-3 px-3 theme-text-muted text-xs">{formatDate(c.issueDate || c.createdAt)}</td>
                  <td className="text-center py-3 px-3">
                    <Badge color={c.status === 'revoked' ? 'rose' : 'emerald'}>{c.status || 'active'}</Badge>
                  </td>
                  <td className="text-center py-3 px-3">
                    {c.status !== 'revoked' && (
                      <button onClick={() => handleRevoke(c._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Revoke">
                        <FiAlertTriangle size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FiAward className="mx-auto theme-text-muted mb-4" size={48} />
          <h3 className="text-lg font-medium theme-text mb-1">No certificates</h3>
          <p className="text-sm theme-text-muted">{search ? 'Try a different search' : 'Issue your first certificate'}</p>
        </Card>
      )}

      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay" onClick={() => setShowIssue(false)}>
          <Card className="p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Issue Certificate</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setShowIssue(false)} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs theme-text-muted mb-1.5">Student</p>
                <select value={issueForm.studentId} onChange={e => {
                  const s = students.find(st => st._id === e.target.value);
                  setIssueForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || '' }));
                }} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class || 'N/A'})</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs theme-text-muted mb-1.5">Course</p>
                <select value={issueForm.courseId} onChange={e => {
                  const c = courses.find(co => co._id === e.target.value);
                  setIssueForm(p => ({ ...p, courseId: e.target.value, courseName: c?.title || '' }));
                }} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs theme-text-muted mb-1.5">Grade</p>
                <select value={issueForm.grade} onChange={e => setIssueForm(p => ({ ...p, grade: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs theme-text-muted mb-1.5">Issue Date</p>
                <input type="date" value={issueForm.issueDate} onChange={e => setIssueForm(p => ({ ...p, issueDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
              <Button className="w-full" onClick={handleIssue} loading={issuing}>Issue Certificate</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
