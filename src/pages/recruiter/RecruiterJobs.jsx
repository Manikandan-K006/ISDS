import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Briefcase, Plus, MapPin, Building2, Clock, Users, Pencil } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, SkeletonCard } from '../../components/ui';

const typeColor = { job: 'indigo', internship: 'amber', research: 'emerald' };

const emptyForm = {
  title: '', company: '', type: 'job', description: '', location: '', stipend: '',
  minCGPA: '', minAttendance: '', minProjects: '', minSkillScore: '', requiredSkills: '', experienceLevel: '', deadline: '',
};

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    API.get('/recruiter/jobs').then(({ data }) => setJobs(data.jobs)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (j) => {
    setEditing(j);
    setForm({
      title: j.title, company: j.company, type: j.type, description: j.description || '', location: j.location || '',
      stipend: j.stipend || '', minCGPA: j.minCGPA ?? '', minAttendance: j.minAttendance ?? '', minProjects: j.minProjects ?? '',
      minSkillScore: j.minSkillScore ?? '', requiredSkills: (j.requiredSkills || []).join(', '), experienceLevel: j.experienceLevel || '',
      deadline: j.deadline ? j.deadline.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      minCGPA: form.minCGPA === '' ? undefined : form.minCGPA,
      minAttendance: form.minAttendance === '' ? undefined : form.minAttendance,
      minProjects: form.minProjects === '' ? undefined : form.minProjects,
      minSkillScore: form.minSkillScore === '' ? undefined : form.minSkillScore,
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: form.deadline || undefined,
    };
    try {
      if (editing) {
        await API.put(`/recruiter/jobs/${editing.id}`, payload);
        toast.success('Job updated');
      } else {
        await API.post('/recruiter/jobs', payload);
        toast.success('Job posted');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (j) => {
    try {
      await API.put(`/recruiter/jobs/${j.id}`, { status: j.status === 'open' ? 'closed' : 'open' });
      toast.success(j.status === 'open' ? 'Job closed' : 'Job reopened');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  if (!jobs) return <div className="space-y-6"><h1 className="text-page-title theme-text">Job Listings</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Job Listings</h1>
          <p className="text-caption theme-text-muted mt-1">Post openings and set eligibility criteria</p>
        </div>
        <Button onClick={openCreate} icon={Plus}>Post Job</Button>
      </div>

      {jobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No jobs posted" description="Post your first job to attract candidates." action={<Button size="sm" onClick={openCreate} icon={Plus}>Post Job</Button>} /></Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Card key={j.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-card-subtitle theme-text">{j.title}</h3>
                    <Badge color={typeColor[j.type] || 'indigo'} size="sm">{j.type}</Badge>
                    <Badge color={j.status === 'open' ? 'emerald' : 'slate'} size="sm" dot>{j.status}</Badge>
                  </div>
                  <p className="text-small theme-text-muted mt-1 inline-flex items-center gap-1.5"><Building2 size={13} /> {j.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(j)} icon={Pencil}>Edit</Button>
                  <Button size="sm" variant={j.status === 'open' ? 'danger' : 'primary'} onClick={() => toggleStatus(j)}>{j.status === 'open' ? 'Close' : 'Reopen'}</Button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-small theme-text-muted flex-wrap">
                {j.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {j.location}</span>}
                {j.stipend && <span className="inline-flex items-center gap-1"><Clock size={13} /> {j.stipend}</span>}
                {j.deadline && <span className="inline-flex items-center gap-1"><Clock size={13} /> Deadline {new Date(j.deadline).toLocaleDateString()}</span>}
                <span className="inline-flex items-center gap-1"><Users size={13} /> {j._count?.applications} applications</span>
              </div>
              {j.description && <p className="text-caption theme-text-muted mt-2 line-clamp-2">{j.description}</p>}
              {(j.requiredSkills || []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-3">{(j.requiredSkills || []).map((s) => <Badge key={s} color="indigo" size="sm">{s}</Badge>)}</div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-card-title theme-text">{editing ? 'Edit Job' : 'Post a Job'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Job title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Developer" />
            <Input label="Company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'job', label: 'Job' }, { value: 'internship', label: 'Internship' }, { value: 'research', label: 'Research' }]} />
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bengaluru / Remote" />
            <Input label="Stipend / Salary" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="₹20,000 / month" />
            <Input label="Experience level" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} placeholder="Fresher" />
            <Input type="date" label="Application deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <label className="text-small theme-text-muted mb-1.5 block">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role and responsibilities..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--primary)] transition-colors resize-none" />
          </div>
          <Input label="Required skills (comma separated)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="JavaScript, React, SQL" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input type="number" step="0.1" label="Min CGPA" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} placeholder="7.5" />
            <Input type="number" step="0.1" label="Min attendance %" value={form.minAttendance} onChange={(e) => setForm({ ...form, minAttendance: e.target.value })} placeholder="75" />
            <Input type="number" label="Min projects" value={form.minProjects} onChange={(e) => setForm({ ...form, minProjects: e.target.value })} placeholder="1" />
            <Input type="number" label="Min skill score" value={form.minSkillScore} onChange={(e) => setForm({ ...form, minSkillScore: e.target.value })} placeholder="50" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Post Job'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
