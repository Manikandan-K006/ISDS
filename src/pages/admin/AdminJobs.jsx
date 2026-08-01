import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Briefcase, Plus, Building2, Users, Pencil, Trash2, MapPin } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, SkeletonCard } from '../../components/ui';

const typeColor = { job: 'indigo', internship: 'amber', research: 'emerald' };

const emptyForm = {
  title: '', company: '', type: 'job', description: '', location: '', stipend: '',
  minCGPA: '', minAttendance: '', minProjects: '', minSkillScore: '', requiredSkills: '', experienceLevel: '', status: 'draft', deadline: '',
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    API.get('/admin/jobs').then(({ data }) => setJobs(data.jobs)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (j) => {
    setEditing(j);
    setForm({
      title: j.title, company: j.company, type: j.type, description: j.description || '', location: j.location || '',
      stipend: j.stipend || '', minCGPA: j.minCGPA ?? '', minAttendance: j.minAttendance ?? '', minProjects: j.minProjects ?? '',
      minSkillScore: j.minSkillScore ?? '', requiredSkills: (j.requiredSkills || []).join(', '), experienceLevel: j.experienceLevel || '',
      status: j.status, deadline: j.deadline ? j.deadline.slice(0, 10) : '',
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
        await API.put(`/admin/jobs/${editing.id}`, payload);
        toast.success('Job updated');
      } else {
        await API.post('/admin/jobs', payload);
        toast.success('Job created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await API.delete(`/admin/jobs/${id}`);
      setJobs((list) => list.filter((j) => j.id !== id));
      toast.success('Job deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  if (!jobs) return <div className="space-y-6"><h1 className="text-page-title theme-text">Job Listings</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Job Listings</h1>
          <p className="text-caption theme-text-muted mt-1">All job postings across recruiters</p>
        </div>
        <Button onClick={openCreate} icon={Plus}>Create Job</Button>
      </div>

      {jobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No jobs yet" description="Create a job posting or wait for recruiters to post." action={<Button size="sm" onClick={openCreate} icon={Plus}>Create Job</Button>} /></Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Card key={j.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-card-subtitle theme-text">{j.title}</h3>
                    <Badge color={typeColor[j.type] || 'indigo'} size="sm">{j.type}</Badge>
                    <Badge color={j.status === 'open' ? 'emerald' : j.status === 'closed' ? 'rose' : 'slate'} size="sm" dot>{j.status}</Badge>
                  </div>
                  <p className="text-small theme-text-muted mt-1 inline-flex items-center gap-1.5"><Building2 size={13} /> {j.company} {j.location && <>· <MapPin size={13} /> {j.location}</>}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="indigo" size="sm"><Users size={11} /> {j._count?.applications} apps</Badge>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(j)} icon={Pencil}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(j.id)} icon={Trash2}>Delete</Button>
                </div>
              </div>
              <p className="text-caption theme-text-muted mt-2">Posted by {j.postedBy?.name || 'Admin'}</p>
              {(j.requiredSkills || []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2.5">{(j.requiredSkills || []).map((s) => <Badge key={s} color="indigo" size="sm">{s}</Badge>)}</div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <form onSubmit={save} className="space-y-4">
          <h2 className="text-card-title theme-text">{editing ? 'Edit Job' : 'Create Job'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Job title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Developer" />
            <Input label="Company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'job', label: 'Job' }, { value: 'internship', label: 'Internship' }, { value: 'research', label: 'Research' }]} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'draft', label: 'Draft' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} />
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bengaluru / Remote" />
            <Input label="Stipend / Salary" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="₹20,000 / month" />
            <Input type="date" label="Application deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <label className="text-small theme-text-muted mb-1.5 block">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--primary)] transition-colors resize-none" />
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
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create Job'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
