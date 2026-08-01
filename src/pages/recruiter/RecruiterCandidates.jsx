import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { User, Search, GitBranch, Globe, Mail, ExternalLink, Users, GraduationCap } from 'lucide-react';
import { Card, Input, Badge, EmptyState, SkeletonCard, Select } from '../../components/ui';

function cgpaColor(cgpa) {
  if (!cgpa) return 'muted';
  if (cgpa >= 8.5) return 'emerald';
  if (cgpa >= 7.5) return 'indigo';
  if (cgpa >= 6.5) return 'amber';
  return 'rose';
}

function skillColor(score) {
  if (score >= 75) return 'emerald';
  if (score >= 50) return 'indigo';
  if (score >= 30) return 'amber';
  return 'rose';
}

export default function RecruiterCandidates() {
  const [candidates, setCandidates] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', departmentId: '', minCgpa: '', hasInternship: false, hasResearch: false, minSkillScore: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    API.get('/recruiter/departments')
      .then(({ data }) => setDepartments(data.departments || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(filters.search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  const fetchCandidates = useCallback(async () => {
    setCandidates(null);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.departmentId) params.set('departmentId', filters.departmentId);
      if (filters.minCgpa) params.set('minCgpa', filters.minCgpa);
      if (filters.hasInternship) params.set('hasInternship', 'true');
      if (filters.hasResearch) params.set('hasResearch', 'true');
      if (filters.minSkillScore) params.set('minSkillScore', filters.minSkillScore);
      const { data } = await API.get(`/recruiter/candidates?${params.toString()}`);
      setCandidates(data.candidates || []);
      setTotal(data.total || data.candidates?.length || 0);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load candidates');
      setCandidates([]);
    }
  }, [debouncedSearch, filters.departmentId, filters.minCgpa, filters.hasInternship, filters.hasResearch, filters.minSkillScore]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const hasActiveFilters = filters.search || filters.departmentId || filters.minCgpa || filters.hasInternship || filters.hasResearch || filters.minSkillScore;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-page-title theme-text">Candidate Directory</h1>
        <p className="text-caption theme-text-muted mt-1">Talent pool built from students who made their career profiles public</p>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Search name, register no, skill..." value={filters.search} onChange={(e) => setFilter('search', e.target.value)} icon={Search} className="w-full" />
          <Select value={filters.departmentId} onChange={(e) => setFilter('departmentId', e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select value={filters.minCgpa} onChange={(e) => setFilter('minCgpa', e.target.value)}>
            <option value="">Min CGPA · Any</option>
            <option value="9">9.0+</option>
            <option value="8.5">8.5+</option>
            <option value="8">8.0+</option>
            <option value="7.5">7.5+</option>
            <option value="7">7.0+</option>
          </Select>
          <Select value={filters.minSkillScore} onChange={(e) => setFilter('minSkillScore', e.target.value)}>
            <option value="">Min skill score · Any</option>
            <option value="80">80%+</option>
            <option value="70">70%+</option>
            <option value="60">60%+</option>
          </Select>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap text-small theme-text-muted">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-[var(--primary)]" checked={filters.hasInternship} onChange={(e) => setFilter('hasInternship', e.target.checked)} />
              Has internship
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-[var(--primary)]" checked={filters.hasResearch} onChange={(e) => setFilter('hasResearch', e.target.checked)} />
              Has research
            </label>
          </div>
          <div className="flex items-center gap-3 text-small theme-text-muted">
            {hasActiveFilters && (
              <button className="hover:text-[var(--primary)]" onClick={() => setFilters({ search: '', departmentId: '', minCgpa: '', hasInternship: false, hasResearch: false, minSkillScore: '' })}>
                Clear filters
              </button>
            )}
            {total > 0 && (
              <span className="inline-flex items-center gap-1.5"><Users size={14} /> {total} candidate{total !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </Card>

      {!candidates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>
      ) : candidates.length === 0 ? (
        <Card><EmptyState icon={User} title="No candidates match" description="Try widening your filters, or ask students to make their career profiles public." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <Card key={c.id} hover className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {c.profilePhoto ? (
                    <img src={c.profilePhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0"><User size={20} className="text-[var(--primary)]" /></div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-card-subtitle theme-text truncate">{c.name}</h3>
                    <p className="text-micro theme-text-muted">{c.registerNumber}{c.department ? ` · ${c.department}` : ''}</p>
                  </div>
                </div>
                <Badge color={cgpaColor(c.cgpa)} size="sm">CGPA {c.cgpa ? c.cgpa.toFixed(2) : '—'}</Badge>
              </div>

              {c.headline && <p className="text-caption theme-text-muted line-clamp-2 -mt-1">{c.headline}</p>}

              <div className="flex flex-wrap gap-1.5">
                {c.topSkills?.map((s) => <Badge key={s.name} color={skillColor(s.score)} size="sm">{s.name} {s.score}%</Badge>)}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-small theme-text-muted">
                {c.careerGoal && <span className="inline-flex items-center gap-1.5"><GraduationCap size={13} /> {c.careerGoal}</span>}
                {c.internshipCount > 0 && <span>{c.internshipCount} internship{c.internshipCount !== 1 ? 's' : ''}</span>}
                {c.researchCount > 0 && <span>{c.researchCount} research paper{c.researchCount !== 1 ? 's' : ''}</span>}
                {c.placementStatus && c.placementStatus !== 'not_eligible' && <Badge color="emerald" size="sm">{c.placementStatus.replace(/_/g, ' ')}</Badge>}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-1">
                <Link to={`/student/${c.registerNumber}`} className="inline-flex items-center gap-1.5 text-small font-medium text-[var(--primary)] hover:underline">
                  <ExternalLink size={13} /> Public portfolio
                </Link>
                <div className="ml-auto flex items-center gap-2">
                  {c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer" className="text-theme-text-muted hover:text-[var(--primary)]"><GitBranch size={15} /></a>}
                  {c.github && <a href={c.github} target="_blank" rel="noreferrer" className="text-theme-text-muted hover:text-[var(--primary)]"><Globe size={15} /></a>}
                  {c.resumeUrl && <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="text-theme-text-muted hover:text-[var(--primary)]"><Mail size={15} /></a>}
                  <a href={`mailto:${c.email}`} className="text-theme-text-muted hover:text-[var(--primary)]" title={c.email}><Mail size={15} /></a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
