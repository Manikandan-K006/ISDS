import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { FolderGit2, Plus, ExternalLink, GitBranch, Star, Trash2, Users, Eye, Lock } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, SkeletonCard } from '../../components/ui';

const statusColor = { idea: 'slate', 'in-progress': 'indigo', completed: 'emerald', abandoned: 'rose' };
const statusLabel = { idea: 'Idea', 'in-progress': 'In Progress', completed: 'Completed', abandoned: 'Abandoned' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '', status: 'idea', visibility: 'private' });

  const load = useCallback(() => {
    API.get('/projects')
      .then(({ data }) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '', status: 'idea', visibility: 'private' }); setShowModal(true); };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description || '',
      techStack: (p.techStack || []).join(', '),
      githubUrl: p.githubUrl || '',
      demoUrl: p.demoUrl || '',
      status: p.status,
      visibility: p.visibility,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await API.put(`/projects/${editing.id}`, payload);
        toast.success('Project updated');
      } else {
        await API.post('/projects', payload);
        toast.success('Project created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  };

  const removeProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      setProjects((list) => list.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">My Projects</h1>
          <p className="text-caption theme-text-muted mt-1">Build your portfolio — public projects show on your recruiter-facing profile</p>
        </div>
        <Button onClick={openCreate} icon={Plus}>New Project</Button>
      </div>

      {projects.length === 0 ? (
        <Card><EmptyState icon={FolderGit2} title="No projects yet" description="Add your first project to start building your portfolio." action={<Button size="sm" onClick={openCreate} icon={Plus}>New Project</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <FolderGit2 size={18} className="text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-card-subtitle theme-text truncate">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color={statusColor[p.status] || 'slate'} size="sm">{statusLabel[p.status] || p.status}</Badge>
                      {p.visibility === 'public' ? <Badge color="emerald" size="sm"><Eye size={11} /> Public</Badge> : <Badge color="slate" size="sm"><Lock size={11} /> Private</Badge>}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeProject(p.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
              </div>

              <p className="text-caption theme-text-muted mt-3 line-clamp-2 flex-1">{p.description || 'No description'}</p>

              {(p.techStack || []).length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {p.techStack.slice(0, 5).map((t) => <Badge key={t} color="indigo" size="sm">{t}</Badge>)}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 text-small theme-text-muted">
                  {p.evaluation?.avgRating && (
                    <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400" /> {p.evaluation.avgRating} ({p.evaluation.count})</span>
                  )}
                  {(p.team || []).length > 0 && <span className="inline-flex items-center gap-1"><Users size={13} /> {p.team.length}</span>}
                  <span className="inline-flex items-center gap-1"><Eye size={13} /> {p.student?.name}</span>
                </div>
                <div className="flex gap-2">
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg theme-text-muted hover:text-[var(--primary)] hover:bg-[var(--hover)]"><GitBranch size={15} /></a>}
                  {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg theme-text-muted hover:text-[var(--primary)] hover:bg-[var(--hover)]"><ExternalLink size={15} /></a>}
                  <button onClick={() => openEdit(p)} className="px-2.5 py-1 rounded-lg text-small theme-text-muted hover:theme-text hover:bg-[var(--hover)]">Edit</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-card-title theme-text">{editing ? 'Edit Project' : 'New Project'}</h2>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="AI Chat Assistant" />
          <div>
            <label className="text-small theme-text-muted mb-1.5 block">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does the project do?" className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--primary)] transition-colors resize-none" />
          </div>
          <Input label="Tech Stack (comma separated)" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MySQL" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="GitBranch URL" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://GitBranch.com/..." />
            <Input label="Demo URL" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'idea', label: 'Idea' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'abandoned', label: 'Abandoned' }]} />
            <Select label="Visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} options={[{ value: 'private', label: 'Private' }, { value: 'public', label: 'Public' }]} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
