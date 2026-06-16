import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMail, FiDownload, FiChevronRight, FiFilter, FiX, FiUser, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    API.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const classes = useMemo(() => {
    const unique = [...new Set(students.map(s => s.class).filter(Boolean))];
    return ['All', ...unique.sort()];
  }, [students]);

  const filtered = useMemo(() => {
    let result = students.filter(s => {
      if (classFilter !== 'All' && s.class !== classFilter) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) && !s.rollNumber?.includes(search) && !s.email?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'gpa') cmp = (a.gpa || 0) - (b.gpa || 0);
      else if (sortBy === 'attendance') cmp = (a.attendance || 0) - (b.attendance || 0);
      else if (sortBy === 'class') cmp = (a.class || '').localeCompare(b.class || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [students, search, classFilter, statusFilter, sortBy, sortDir]);

  if (loading) return <PageSkeleton />;

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const clearFilters = () => {
    setSearch('');
    setClassFilter('All');
    setStatusFilter('All');
  };

  const hasFilters = search || classFilter !== 'All' || statusFilter !== 'All';

  const getStatusStyle = (status) => {
    if (status === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return 'text-emerald-400';
    if (gpa >= 2.5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getAttendanceColor = (att) => {
    if (att >= 80) return 'text-emerald-400';
    if (att >= 70) return 'text-amber-400';
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Students</h1>
          <p className="text-indigo-200 mt-1">Manage all students across classes</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or roll no..."
            className="w-full theme-card border theme-border rounded-xl pl-10 pr-10 py-2.5 text-sm theme-text placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl theme-hover theme-text-muted text-sm hover:bg-white/[0.1] transition-colors flex items-center gap-1.5">
              <FiFilter size={14} /> Clear
            </button>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs theme-text-muted">{selected.length} selected</span>
            <button className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/30 transition-colors">
              <FiMail size={16} />
            </button>
            <button className="p-2.5 rounded-xl theme-card theme-text-muted border theme-border hover:bg-[var(--hover)] transition-colors">
              <FiDownload size={16} />
            </button>
          </div>
        )}
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
                    <th className="p-3 pl-5 w-12">
                      <input type="checkbox"
                        checked={filtered.length > 0 && selected.length === filtered.length}
                        onChange={e => setSelected(e.target.checked ? filtered.map(s => s._id) : [])}
                        className="rounded theme-border-light theme-input text-indigo-500 focus:ring-indigo-500/30"
                      />
                    </th>
                    <SortHeader field="name">Student</SortHeader>
                    <SortHeader field="class">Class</SortHeader>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Attendance</th>
                    <SortHeader field="gpa">GPA</SortHeader>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Last Active</th>
                    <th className="p-3 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b theme-border hover:theme-subtle transition-colors"
                    >
                      <td className="p-3 pl-5">
                        <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)}
                          className="rounded theme-border-light theme-input text-indigo-500 focus:ring-indigo-500/30"
                        />
                      </td>
                      <td className="p-3">
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
                        <span className="text-sm theme-text">{s.class}</span>
                        {s.rollNumber && <span className="text-xs theme-text-muted ml-2">Roll: {s.rollNumber}</span>}
                      </td>
                      <td className="p-3">
                        {s.attendance != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 theme-hover rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${s.attendance >= 80 ? 'bg-emerald-500' : s.attendance >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${s.attendance}%` }} />
                            </div>
                            <span className={`text-sm font-medium ${getAttendanceColor(s.attendance)}`}>{s.attendance}%</span>
                          </div>
                        ) : <span className="text-xs theme-text-muted">N/A</span>}
                      </td>
                      <td className="p-3">
                        <span className={`text-sm font-medium ${getGPAColor(s.gpa || 0)}`}>{s.gpa || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyle(s.status || 'active')}`}>
                          {s.status === 'active' ? 'Active' : s.status === 'at-risk' ? 'At Risk' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs ${s.lastActive ? (s.lastActive.includes('d') ? 'theme-text-muted' : 'theme-text-muted') : 'theme-text-muted'}`}>{s.lastActive || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/students/${s._id}`} className="flex items-center justify-center w-8 h-8 rounded-lg hover:theme-hover theme-text-muted hover:text-indigo-400 transition-colors">
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
              <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
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
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)}
                      className="rounded theme-border-light theme-input text-indigo-500 focus:ring-indigo-500/30"
                    />
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyle(s.status || 'active')}`}>
                      {s.status === 'active' ? 'Active' : s.status === 'at-risk' ? 'At Risk' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Class</p>
                    <p className="text-sm theme-text font-medium">{s.class || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">GPA</p>
                    <p className={`text-sm font-medium ${getGPAColor(s.gpa || 0)}`}>{s.gpa || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Attendance</p>
                    <p className={`text-sm font-medium ${getAttendanceColor(s.attendance || 0)}`}>{s.attendance != null ? `${s.attendance}%` : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs theme-text-muted">
                    {s.lastActive?.includes('d') ? (
                      <FiAlertTriangle size={12} className="text-rose-400" />
                    ) : (
                      <FiCheckCircle size={12} className="text-emerald-400" />
                    )}
                    Active {s.lastActive || 'N/A'}
                  </div>
                  <Link to={`/admin/students/${s._id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
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
              <span>{selected.length > 0 ? `${selected.length} selected` : ''}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentList;
