import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiBriefcase, FiFileText, FiPlus, FiEdit2, FiTrash2, FiGithub, FiTrendingUp, FiBookOpen, FiAward, FiAlertCircle } from 'react-icons/fi';
import API from '../../api/client';
import toast from 'react-hot-toast';
import { Button, Modal, Input } from '../../components/ui';

const INITIAL_FORM = { name: '', phone: '', bio: '', careerGoal: '', github: '', leetcode: '', codeforces: '', hackerrank: '', codingProblemsSolved: '' };
const INITIAL_INTERNSHIP = { company: '', role: '', startDate: '', endDate: '', status: 'ongoing', mentorName: '', summary: '', offerLetterUrl: '', completionCertificateUrl: '' };
const INITIAL_PAPER = { title: '', type: 'journal', venue: '', year: '', authors: '', doi: '', link: '', status: 'published' };

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [papers, setPapers] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [intModal, setIntModal] = useState(false);
  const [intForm, setIntForm] = useState(INITIAL_INTERNSHIP);
  const [intSaving, setIntSaving] = useState(false);
  const [intEditId, setIntEditId] = useState(null);

  const [paperModal, setPaperModal] = useState(false);
  const [paperForm, setPaperForm] = useState(INITIAL_PAPER);
  const [paperSaving, setPaperSaving] = useState(false);
  const [paperEditId, setPaperEditId] = useState(null);

  useEffect(() => {
    API.get('/students/profile')
      .then(res => {
        setProfile(res.data?.profile || null);
        setInternships(res.data?.internships || []);
        setPapers(res.data?.researchPapers || []);
        if (res.data?.profile) {
          const p = res.data.profile;
          setForm({
            name: p.name || '', phone: p.phone || '', bio: p.bio || '', careerGoal: p.careerGoal || '',
            github: p.github || '', leetcode: p.leetcode || '', codeforces: p.codeforces || '', hackerrank: p.hackerrank || '',
            codingProblemsSolved: p.codingProblemsSolved != null ? p.codingProblemsSolved : '',
          });
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/students/profile', form);
      setProfile(prev => ({ ...prev, ...data.user }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const openInternship = (int) => {
    if (int) {
      setIntEditId(int.id);
      setIntForm({
        company: int.company || '', role: int.role || '', startDate: int.startDate ? int.startDate.slice(0, 10) : '', endDate: int.endDate ? int.endDate.slice(0, 10) : '',
        status: int.status || 'ongoing', mentorName: int.mentorName || '', summary: int.summary || '',
        offerLetterUrl: int.offerLetterUrl || '', completionCertificateUrl: int.completionCertificateUrl || '',
      });
    } else {
      setIntEditId(null);
      setIntForm(INITIAL_INTERNSHIP);
    }
    setIntModal(true);
  };

  const saveInternship = async () => {
    setIntSaving(true);
    try {
      if (intEditId) {
        const { data } = await API.put(`/students/internships/${intEditId}`, intForm);
        setInternships(prev => prev.map(i => i.id === data.internship.id ? data.internship : i));
      } else {
        const { data } = await API.post('/students/internships', intForm);
        setInternships(prev => [data.internship, ...prev]);
      }
      setIntModal(false);
      toast.success('Internship saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save internship');
    } finally {
      setIntSaving(false);
    }
  };

  const deleteInternship = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await API.delete(`/students/internships/${id}`);
      setInternships(prev => prev.filter(i => i.id !== id));
      toast.success('Internship deleted');
    } catch (err) {
      toast.error('Failed to delete internship');
    }
  };

  const openPaper = (p) => {
    if (p) {
      setPaperEditId(p.id);
      const authors = Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || '');
      setPaperForm({
        title: p.title || '', type: p.type || 'journal', venue: p.venue || '', year: p.year != null ? p.year : '', authors,
        doi: p.doi || '', link: p.link || '', status: p.status || 'published',
      });
    } else {
      setPaperEditId(null);
      setPaperForm(INITIAL_PAPER);
    }
    setPaperModal(true);
  };

  const savePaper = async () => {
    setPaperSaving(true);
    try {
      const payload = {
        ...paperForm,
        year: paperForm.year ? parseInt(paperForm.year) : undefined,
        authors: paperForm.authors.split(',').map(a => a.trim()).filter(Boolean),
      };
      if (paperEditId) {
        const { data } = await API.put(`/students/research/${paperEditId}`, payload);
        setPapers(prev => prev.map(p => p.id === data.paper.id ? data.paper : p));
      } else {
        const { data } = await API.post('/students/research', payload);
        setPapers(prev => [data.paper, ...prev]);
      }
      setPaperModal(false);
      toast.success('Research paper saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save research paper');
    } finally {
      setPaperSaving(false);
    }
  };

  const deletePaper = async (id) => {
    if (!window.confirm('Delete this research paper?')) return;
    try {
      await API.delete(`/students/research/${id}`);
      setPapers(prev => prev.filter(p => p.id !== id));
      toast.success('Research paper deleted');
    } catch (err) {
      toast.error('Failed to delete research paper');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  const stats = [
    { label: 'CGPA', value: profile?.cgpa != null ? profile.cgpa : '—', icon: FiTrendingUp, color: 'text-emerald-400' },
    { label: 'Semester GPA', value: profile?.currentSemesterGpa != null ? profile.currentSemesterGpa : '—', icon: FiAward, color: 'text-indigo-400' },
    { label: 'Credits', value: profile?.creditsEarned != null ? `${profile.creditsEarned} / ${profile.creditsRequired || '—'}` : '—', icon: FiBookOpen, color: 'text-purple-400' },
    { label: 'Backlogs', value: profile?.backlogs ?? 0, icon: FiAlertCircle, color: 'text-rose-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Profile</h1>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold theme-text">{profile?.name}</h2>
            <p className="text-sm theme-text mt-0.5">{profile?.program || 'Program'} · {profile?.department || 'Department'}</p>
            <p className="text-xs theme-text-muted mt-1">
              {profile?.registerNumber && <span className="mr-3">Reg: {profile.registerNumber}</span>}
              {profile?.semester && <span className="mr-3">Sem {profile.semester}</span>}
              {profile?.batch && <span className="mr-3">Batch {profile.batch}</span>}
              {profile?.section && <span>Section {profile.section}</span>}
            </p>
            {profile?.facultyAdvisor && (
              <p className="text-xs theme-text-muted mt-1">Faculty Advisor: {profile.facultyAdvisor.name}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="theme-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon size={16} className={s.color} />
              <span className="text-xs theme-text-muted">{s.label}</span>
            </div>
            <p className="text-xl font-bold theme-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="theme-card rounded-2xl p-6 card-shadow">
        <h2 className="text-card-title theme-text mb-5">Academic & Career Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div className="md:col-span-2">
            <Input label="Bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Input label="Career Goal" value={form.careerGoal} onChange={e => setForm({ ...form, careerGoal: e.target.value })} placeholder="e.g. Full-stack developer at a product company" />
          <Input label="Coding Problems Solved" type="number" value={form.codingProblemsSolved} onChange={e => setForm({ ...form, codingProblemsSolved: e.target.value })} />
          <Input icon={FiGithub} label="GitHub Profile" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/username" />
          <Input label="LeetCode" value={form.leetcode} onChange={e => setForm({ ...form, leetcode: e.target.value })} placeholder="https://leetcode.com/username" />
          <Input label="Codeforces" value={form.codeforces} onChange={e => setForm({ ...form, codeforces: e.target.value })} placeholder="https://codeforces.com/profile/username" />
          <Input label="HackerRank" value={form.hackerrank} onChange={e => setForm({ ...form, hackerrank: e.target.value })} placeholder="https://hackerrank.com/username" />
        </div>
        <div className="mt-5">
          <Button loading={saving} onClick={handleSave} icon={FiSave}>Save Changes</Button>
        </div>
      </div>

      <div className="theme-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-title theme-text flex items-center gap-2"><FiBriefcase className="text-indigo-400" /> Internships</h2>
          <Button size="sm" icon={FiPlus} onClick={() => openInternship(null)}>Add Internship</Button>
        </div>
        {internships.length === 0 ? (
          <p className="text-sm theme-text-muted py-6 text-center">No internships yet. Add your internship experience.</p>
        ) : (
          <div className="space-y-3">
            {internships.map(int => (
              <div key={int.id} className="border border-theme-border rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold theme-text">{int.role} at {int.company}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${int.status === 'ongoing' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{int.status}</span>
                    {int.isVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Verified</span>}
                  </div>
                  <p className="text-xs theme-text-muted mt-1">{int.startDate ? int.startDate.slice(0, 10) : ''} → {int.endDate ? int.endDate.slice(0, 10) : (int.status === 'ongoing' ? 'Present' : '')}</p>
                  {int.mentorName && <p className="text-xs theme-text-muted mt-1">Mentor: {int.mentorName}</p>}
                  {int.summary && <p className="text-sm theme-text-muted mt-2">{int.summary}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openInternship(int)} className="p-2 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors"><FiEdit2 size={14} /></button>
                  <button onClick={() => deleteInternship(int.id)} className="p-2 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="theme-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-title theme-text flex items-center gap-2"><FiFileText className="text-indigo-400" /> Research Papers</h2>
          <Button size="sm" icon={FiPlus} onClick={() => openPaper(null)}>Add Paper</Button>
        </div>
        {papers.length === 0 ? (
          <p className="text-sm theme-text-muted py-6 text-center">No research papers yet. Add your publications.</p>
        ) : (
          <div className="space-y-3">
            {papers.map(p => (
              <div key={p.id} className="border border-theme-border rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold theme-text">{p.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-purple-500/10 text-purple-400">{p.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize theme-text-muted bg-[var(--hover)]">{p.status}</span>
                  </div>
                  <p className="text-xs theme-text-muted mt-1">{p.venue && `${p.venue} · `}{p.year || ''}</p>
                  {p.doi && <p className="text-xs theme-text-muted mt-1">DOI: {p.doi}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openPaper(p)} className="p-2 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors"><FiEdit2 size={14} /></button>
                  <button onClick={() => deletePaper(p.id)} className="p-2 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={intModal} onClose={() => setIntModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{intEditId ? 'Edit Internship' : 'Add Internship'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company" value={intForm.company} onChange={e => setIntForm({ ...intForm, company: e.target.value })} />
            <Input label="Role" value={intForm.role} onChange={e => setIntForm({ ...intForm, role: e.target.value })} />
            <Input label="Start Date" type="date" value={intForm.startDate} onChange={e => setIntForm({ ...intForm, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={intForm.endDate} onChange={e => setIntForm({ ...intForm, endDate: e.target.value })} />
            <select value={intForm.status} onChange={e => setIntForm({ ...intForm, status: e.target.value })}
              className="theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <Input label="Mentor Name" value={intForm.mentorName} onChange={e => setIntForm({ ...intForm, mentorName: e.target.value })} />
            <div className="sm:col-span-2">
              <Input label="Offer Letter URL" value={intForm.offerLetterUrl} onChange={e => setIntForm({ ...intForm, offerLetterUrl: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Completion Certificate URL" value={intForm.completionCertificateUrl} onChange={e => setIntForm({ ...intForm, completionCertificateUrl: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Summary" value={intForm.summary} onChange={e => setIntForm({ ...intForm, summary: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIntModal(false)}>Cancel</Button>
            <Button loading={intSaving} onClick={saveInternship}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={paperModal} onClose={() => setPaperModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{paperEditId ? 'Edit Research Paper' : 'Add Research Paper'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Title" value={paperForm.title} onChange={e => setPaperForm({ ...paperForm, title: e.target.value })} />
            </div>
            <select value={paperForm.type} onChange={e => setPaperForm({ ...paperForm, type: e.target.value })}
              className="theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="preprint">Preprint</option>
              <option value="book_chapter">Book Chapter</option>
            </select>
            <select value={paperForm.status} onChange={e => setPaperForm({ ...paperForm, status: e.target.value })}
              className="theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
              <option value="published">Published</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
            </select>
            <Input label="Venue / Journal" value={paperForm.venue} onChange={e => setPaperForm({ ...paperForm, venue: e.target.value })} />
            <Input label="Year" type="number" value={paperForm.year} onChange={e => setPaperForm({ ...paperForm, year: e.target.value })} />
            <div className="sm:col-span-2">
              <Input label="Authors (comma separated)" value={paperForm.authors} onChange={e => setPaperForm({ ...paperForm, authors: e.target.value })} />
            </div>
            <Input label="DOI" value={paperForm.doi} onChange={e => setPaperForm({ ...paperForm, doi: e.target.value })} />
            <Input label="Link" value={paperForm.link} onChange={e => setPaperForm({ ...paperForm, link: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setPaperModal(false)}>Cancel</Button>
            <Button loading={paperSaving} onClick={savePaper}>Save</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
