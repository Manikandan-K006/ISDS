import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiChevronRight, FiUser } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    setLoading(true);
    API.get('/admin/users', { params: { role: 'student', limit: 100 } })
      .then(res => setStudents(res.data?.users || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const programs = useMemo(() => {
    const unique = [...new Set(students.map(s => s.program?.name).filter(Boolean))];
    return ['All', ...unique.sort()];
  }, [students]);

  const filtered = useMemo(() => {
    let result = students.filter(s => {
      if (programFilter !== 'All' && s.program?.name !== programFilter) return false;
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      const q = search.toLowerCase();
      if (search && !s.name?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q) && !s.registerNumber?.toLowerCase().includes(q)) return false;
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'cgpa') cmp = (a.cgpa || 0) - (b.cgpa || 0);
      else if (sortBy === 'semester') cmp = (a.semester || 0) - (b.semester || 0);
      else if (sortBy === 'program') cmp = (a.program?.name || '').localeCompare(b.program?.name || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [students, search, programFilter, statusFilter, sortBy, sortDir]);

  if (loading) return <PageSkeleton />;

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const clearFilters = () => {
    setSearch('');
    setProgramFilter('All');
    setStatusFilter('All');
  };

  const hasFilters = search || programFilter !== 'All' || statusFilter !== 'All';

  const getCGPAColor = (gpa) => {
    if (gpa >= 8) return 'text-emerald-400';
    if (gpa >= 6.5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const SortHeader = ({ field, children }) => (
    <th onClick={() => toggleSort(field)} className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider cursor-pointer hover:theme-text transition-colors select-none">
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <span className="text-indigo-400">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Students</h1>
          <p className="theme-text mt-1">Manage students across departments, programs, and semesters</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or register no..."
            className="w-full theme-card border theme-border rounded-xl pl-10 pr-10 py-2.5 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select value={programFilter} onChange={e => setProgramFilter(e.target.value)}
            className="theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            {programs.map(c => <option key={c} value={c}>{c === 'All' ? 'All Programs' : c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl theme-hover theme-text-muted text-sm hover:bg-[var(--hover)] transition-colors flex items-center gap-1.5">
              <FiFilter size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiUser className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No students found</p>
          <p className="theme-text-muted text-sm mt-1">Students will appear here once they register.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block theme-card border theme-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border">
                    <SortHeader field="name">Student</SortHeader>
                    <SortHeader field="program">Program</SortHeader>
                    <SortHeader field="semester">Semester</SortHeader>
                    <SortHeader field="cgpa">CGPA</SortHeader>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Backlogs</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Placement</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
                    <th className="p-3 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b theme-border hover:theme-subtle transition-colors"
                    >
                      <td className="p-3 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-400">{s.name?.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <p className="text-sm theme-text font-medium">{s.name}</p>
                            <p className="text-xs theme-text-muted">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">{s.program?.name || '—'}</span>
                        {s.registerNumber && <span className="text-xs theme-text-muted ml-1 block">Reg: {s.registerNumber}</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">{s.semester ? `Sem ${s.semester}` : s.class || '—'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm font-medium ${getCGPAColor(s.cgpa || 0)}`}>{s.cgpa != null ? s.cgpa : 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">{s.backlogs ?? 0}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text capitalize">{s.placementStatus || '—'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${s.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/students/${s.id}`} className="flex items-center justify-center w-8 h-8 rounded-lg hover:theme-hover theme-text-muted hover:text-indigo-400 transition-colors">
                          <FiChevronRight size={16} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <FiUser className="mx-auto theme-text-muted mb-3" size={32} />
                <p className="theme-text-muted text-sm">No students match your filters</p>
                <button onClick={clearFilters} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Clear filters</button>
              </div>
            )}
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="theme-card border theme-border rounded-2xl p-4 hover:theme-border-light transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-indigo-400">{s.name?.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm theme-text font-medium">{s.name}</p>
                      <p className="text-xs theme-text-muted">{s.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Program</p>
                    <p className="text-sm theme-text font-medium">{s.program?.name || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Semester</p>
                    <p className="text-sm theme-text font-medium">{s.semester ? `Sem ${s.semester}` : s.class || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">CGPA</p>
                    <p className={`text-sm font-medium ${getCGPAColor(s.cgpa || 0)}`}>{s.cgpa != null ? s.cgpa : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs theme-text-muted">
                    <span className="capitalize">{s.placementStatus || 'Not placed'}</span>
                  </div>
                  <Link to={`/admin/students/${s.id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                    View <FiChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="theme-card border theme-border rounded-2xl p-8 text-center">
                <FiUser className="mx-auto theme-text-muted mb-3" size={28} />
                <p className="theme-text-muted text-sm">No students match your filters</p>
                <button onClick={clearFilters} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Clear filters</button>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>Showing {filtered.length} of {students.length} students</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentList;
