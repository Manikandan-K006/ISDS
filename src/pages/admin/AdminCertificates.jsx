import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward, FiSearch, FiX, FiCheck, FiAlertTriangle, FiCopy, FiRefreshCw,
  FiDownload, FiTrash2, FiEye, FiFilter, FiCalendar, FiUser, FiBook,
  FiStar, FiShield, FiClock, FiBarChart2, FiMoreVertical, FiFileText,
} from 'react-icons/fi';
import {
  getCertificates, issueCertificate, revokeCertificate, restoreCertificate,
  regenerateCertificate, deleteCertificate, getCertificateStats,
  trackDownload, getCertificateFileUrl,
} from '../../api/certificates';
import { getStudents } from '../../api/students';
import { getCourses } from '../../api/courses';
import { Card, Input, Button, Badge } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const AdminCertificates = () => {
  const [data, setData] = useState({ certificates: [], total: 0 });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [issueForm, setIssueForm] = useState({ studentId: '', studentName: '', courseId: '', courseName: '', grade: 'A' });
  const [issuing, setIssuing] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getCertificates({ search, status: statusFilter || undefined }),
      getStudents(), getCourses(), getCertificateStats(),
    ]);
    if (results[0].status === 'fulfilled') setData(results[0].value);
    if (results[1].status === 'fulfilled') setStudents(results[1].value);
    if (results[2].status === 'fulfilled') setCourses(results[2].value);
    if (results[3].status === 'fulfilled') setStats(results[3].value);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [search, statusFilter]);

  const handleIssue = async () => {
    if (!issueForm.studentId || !issueForm.courseId) return toast.error('Select student and course');
    setIssuing(true);
    try {
      await issueCertificate(issueForm);
      toast.success('Certificate issued successfully');
      setShowIssue(false);
      setIssueForm({ studentId: '', studentName: '', courseId: '', courseName: '', grade: 'A' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue certificate');
    }
    setIssuing(false);
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate? This action can be reversed.')) return;
    try {
      await revokeCertificate(id);
      toast.success('Certificate revoked');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to revoke');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreCertificate(id);
      toast.success('Certificate restored');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to restore');
    }
  };

  const handleRegenerate = async (id) => {
    try {
      await regenerateCertificate(id);
      toast.success('Certificate files regenerated');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to regenerate');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this certificate? This cannot be undone.')) return;
    try {
      await deleteCertificate(id);
      toast.success('Certificate deleted permanently');
      setSelected(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleDownload = async (cert, type) => {
    try {
      const url = getCertificateFileUrl(cert.certificateId, type);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.certificateId}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await trackDownload(cert._id).catch(() => {});
      toast.success(`${type.toUpperCase()} downloaded`);
    } catch {
      toast.error(`Failed to download ${type.toUpperCase()}`);
    }
  };

  const filtered = data.certificates || [];

  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

  if (loading && !data.certificates.length) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold theme-text">Certificate Management</h1>
          <p className="text-sm theme-text-muted mt-1">Total: {data.total} certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={FiBarChart2} onClick={() => setShowStats(true)}>Stats</Button>
          <Button icon={FiRefreshCw} variant="ghost" size="sm" onClick={fetchAll} />
          <Button icon={FiAward} onClick={() => setShowIssue(true)}>Issue Certificate</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input icon={FiSearch} placeholder="Search certificates..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors"
        >
          <option value="">All Status</option>
          <option value="generated">Generated</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border theme-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b theme-border bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 theme-text-muted font-medium text-xs">Certificate</th>
                <th className="text-left py-3 px-4 theme-text-muted font-medium text-xs">Student</th>
                <th className="text-left py-3 px-4 theme-text-muted font-medium text-xs">Course</th>
                <th className="text-center py-3 px-4 theme-text-muted font-medium text-xs">Grade</th>
                <th className="text-center py-3 px-4 theme-text-muted font-medium text-xs">Issued</th>
                <th className="text-center py-3 px-4 theme-text-muted font-medium text-xs">Status</th>
                <th className="text-center py-3 px-4 theme-text-muted font-medium text-xs">Downloads</th>
                <th className="text-center py-3 px-4 theme-text-muted font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b theme-border-light hover:theme-hover transition-colors">
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono text-indigo-400">{c.certificateId}</code>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="theme-text font-medium text-sm">{c.studentName}</p>
                      {c.email && <p className="text-[10px] theme-text-muted">{c.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="theme-text-muted text-sm">{c.courseName}</p>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge color={c.grade === 'A+' || c.grade === 'A' ? 'emerald' : c.grade === 'B+' || c.grade === 'B' ? 'indigo' : c.grade === 'C' ? 'amber' : 'rose'}>
                      {c.grade || 'N/A'}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4 theme-text-muted text-xs">
                    {formatDate(c.issueDate || c.createdAt)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge color={c.status === 'revoked' ? 'rose' : c.status === 'expired' ? 'amber' : 'emerald'}>
                      {c.status || 'active'}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4 theme-text-muted text-xs">
                    {c.downloadCount || 0}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" title="View">
                        <FiEye size={14} />
                      </button>
                      <button onClick={() => handleDownload(c, 'pdf')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Download PDF">
                        <FiDownload size={14} />
                      </button>
                      {c.status !== 'revoked' && (
                        <button onClick={() => handleRevoke(c._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Revoke">
                          <FiAlertTriangle size={14} />
                        </button>
                      )}
                      {c.status === 'revoked' && (
                        <button onClick={() => handleRestore(c._id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Restore">
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button onClick={() => handleRegenerate(c._id)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors" title="Regenerate">
                        <FiRefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.totalPages > 1 && (
            <div className="p-4 border-t theme-border flex items-center justify-between text-sm theme-text-muted">
              <span>Page {data.page} of {data.totalPages}</span>
              <div className="flex gap-2">
                {data.page > 1 && <Button variant="ghost" size="sm">Previous</Button>}
                {data.page < data.totalPages && <Button variant="ghost" size="sm">Next</Button>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/5 flex items-center justify-center mx-auto mb-4 border border-indigo-500/10">
            <FiAward className="theme-text-muted" size={32} />
          </div>
          <h3 className="text-lg font-medium theme-text mb-1">No certificates</h3>
          <p className="text-sm theme-text-muted">{search ? 'Try a different search' : 'Issue your first certificate to get started'}</p>
        </Card>
      )}

      {/* Issue Modal */}
      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay" onClick={() => setShowIssue(false)}>
          <Card className="p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Issue Certificate</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setShowIssue(false)} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs theme-text-muted mb-1.5 font-medium">Student</p>
                <select value={issueForm.studentId} onChange={e => {
                  const s = students.find(st => st._id === e.target.value);
                  setIssueForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || '' }));
                }} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} {s.email ? `(${s.email})` : ''}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs theme-text-muted mb-1.5 font-medium">Course</p>
                <select value={issueForm.courseId} onChange={e => {
                  const c = courses.find(co => co._id === e.target.value);
                  setIssueForm(p => ({ ...p, courseId: e.target.value, courseName: c?.title || '' }));
                }} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.domain || 'General'})</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs theme-text-muted mb-1.5 font-medium">Grade</p>
                <select value={issueForm.grade} onChange={e => setIssueForm(p => ({ ...p, grade: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors">
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <Button className="w-full" onClick={handleIssue} loading={issuing}>
                Issue Certificate
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay" onClick={() => setShowStats(false)}>
          <Card className="p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Certificate Analytics</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setShowStats(false)} />
            </div>

            {stats ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="theme-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold theme-text">{stats.total}</p>
                    <p className="text-xs theme-text-muted mt-1">Total Certificates</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-400">{stats.thisMonth}</p>
                    <p className="text-xs theme-text-muted mt-1">This Month</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.active || stats.generated}</p>
                    <p className="text-xs theme-text-muted mt-1">Active</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-rose-400">{stats.revoked}</p>
                    <p className="text-xs theme-text-muted mt-1">Revoked</p>
                  </div>
                </div>

                <div className="theme-subtle rounded-xl p-4">
                  <p className="text-sm font-semibold theme-text mb-3">Verification Checks</p>
                  <p className="text-3xl font-bold theme-text">{stats.totalVerifications || 0}</p>
                  <p className="text-xs theme-text-muted mt-1">Total verifications performed</p>
                </div>

                {stats.byCourse && stats.byCourse.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold theme-text mb-3">Certificates by Course</p>
                    <div className="space-y-2">
                      {stats.byCourse.sort((a, b) => b.count - a.count).slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="theme-text-muted truncate mr-2">{item.name}</span>
                          <span className="theme-text font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.byInstructor && stats.byInstructor.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold theme-text mb-3">Certificates by Instructor</p>
                    <div className="space-y-2">
                      {stats.byInstructor.sort((a, b) => b.count - a.count).slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="theme-text-muted truncate mr-2">{item.name}</span>
                          <span className="theme-text font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.topStudents && stats.topStudents.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold theme-text mb-3">Top Performing Students</p>
                    <div className="space-y-2">
                      {stats.topStudents.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="theme-text-muted truncate mr-2">{s.name} — {s.course}</span>
                          <span className="text-indigo-400 font-medium">{s.grade} ({s.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm theme-text-muted text-center py-8">Loading stats...</p>
            )}
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 theme-overlay" onClick={() => setSelected(null)}>
          <Card className="p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold theme-text">Certificate Details</h2>
              <Button variant="ghost" size="sm" icon={FiX} onClick={() => setSelected(null)} />
            </div>
            <div className="space-y-3">
              <div className="theme-subtle rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Certificate ID</span>
                  <code className="text-xs font-mono text-indigo-400">{selected.certificateId}</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Student</span>
                  <span className="theme-text font-medium">{selected.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Email</span>
                  <span className="theme-text">{selected.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Course</span>
                  <span className="theme-text">{selected.courseName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Category</span>
                  <span className="theme-text">{selected.courseCategory || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Duration</span>
                  <span className="theme-text">{selected.duration || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Instructor</span>
                  <span className="theme-text">{selected.instructor || 'Manikandan'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Director</span>
                  <span className="theme-text">{selected.director || 'Mani K'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Grade</span>
                  <Badge color={selected.grade === 'A+' || selected.grade === 'A' ? 'emerald' : 'indigo'}>{selected.grade}</Badge>
                </div>
                {selected.percentage && (
                  <div className="flex justify-between text-sm">
                    <span className="theme-text-muted">Score</span>
                    <span className="theme-text font-medium">{selected.percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Issue Date</span>
                  <span className="theme-text">{formatDate(selected.issueDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Completion Date</span>
                  <span className="theme-text">{formatDate(selected.completionDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Status</span>
                  <Badge color={selected.status === 'revoked' ? 'rose' : 'emerald'}>{selected.status || 'active'}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Downloads</span>
                  <span className="theme-text">{selected.downloadCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Shares</span>
                  <span className="theme-text">{selected.shareCount || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" icon={FiDownload} onClick={() => handleDownload(selected, 'pdf')}>
                  PDF
                </Button>
                <Button variant="secondary" className="flex-1" icon={FiFileText} onClick={() => handleDownload(selected, 'docx')}>
                  DOCX
                </Button>
              </div>

              <div className="flex gap-2">
                {selected.status !== 'revoked' ? (
                  <Button variant="secondary" className="flex-1" icon={FiAlertTriangle} onClick={() => { handleRevoke(selected._id); setSelected(null); }}>
                    Revoke
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" icon={FiCheck} onClick={() => { handleRestore(selected._id); setSelected(null); }}>
                    Restore
                  </Button>
                )}
                <Button variant="secondary" className="flex-1" icon={FiRefreshCw} onClick={() => { handleRegenerate(selected._id); }}>
                  Regenerate
                </Button>
              </div>

              <Button variant="secondary" className="w-full" icon={FiTrash2} onClick={() => { handleDelete(selected._id); }}>
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
