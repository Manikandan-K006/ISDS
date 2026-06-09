import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMail, FiDownload, FiChevronRight, FiFilter, FiX, FiUser, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const mockStudents = [
  { _id: '1', name: 'Arjun Sharma', email: 'arjun@school.com', class: '10A', rollNo: '1012', attendance: 87, gpa: 3.6, credits: 28, lastActive: '2h ago', status: 'active' },
  { _id: '2', name: 'Priya Patel', email: 'priya@school.com', class: '10A', rollNo: '1015', attendance: 92, gpa: 3.7, credits: 35, lastActive: '1h ago', status: 'active' },
  { _id: '3', name: 'Rahul Singh', email: 'rahul@school.com', class: '10B', rollNo: '1020', attendance: 90, gpa: 3.6, credits: 30, lastActive: '3h ago', status: 'active' },
  { _id: '4', name: 'Ananya Gupta', email: 'ananya@school.com', class: '9A', rollNo: '901', attendance: 98, gpa: 3.9, credits: 42, lastActive: '30m ago', status: 'active' },
  { _id: '5', name: 'Vikram Joshi', email: 'vikram@school.com', class: '10B', rollNo: '1025', attendance: 62, gpa: 2.1, credits: 12, lastActive: '2d ago', status: 'at-risk' },
  { _id: '6', name: 'Neha Kapoor', email: 'neha@school.com', class: '9A', rollNo: '905', attendance: 68, gpa: 2.5, credits: 15, lastActive: '1d ago', status: 'at-risk' },
  { _id: '7', name: 'Rohit Kumar', email: 'rohit@school.com', class: '11A', rollNo: '1101', attendance: 58, gpa: 1.8, credits: 8, lastActive: '5d ago', status: 'at-risk' },
  { _id: '8', name: 'Sneha Reddy', email: 'sneha@school.com', class: '10A', rollNo: '1018', attendance: 95, gpa: 3.8, credits: 38, lastActive: '1h ago', status: 'active' },
  { _id: '9', name: 'Amit Verma', email: 'amit@school.com', class: '9B', rollNo: '910', attendance: 85, gpa: 3.2, credits: 22, lastActive: '4h ago', status: 'active' },
  { _id: '10', name: 'Kavita Sharma', email: 'kavita@school.com', class: '11B', rollNo: '1110', attendance: 78, gpa: 3.0, credits: 20, lastActive: '1d ago', status: 'active' },
  { _id: '11', name: 'Ravi Deshmukh', email: 'ravi@school.com', class: '11A', rollNo: '1105', attendance: 82, gpa: 3.3, credits: 25, lastActive: '6h ago', status: 'active' },
  { _id: '12', name: 'Meera Nair', email: 'meera@school.com', class: '9B', rollNo: '915', attendance: 91, gpa: 3.5, credits: 32, lastActive: '3h ago', status: 'active' },
];

const classes = ['All', '9A', '9B', '10A', '10B', '11A', '11B'];

const StudentList = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let result = mockStudents.filter(s => {
      if (classFilter !== 'All' && s.class !== classFilter) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.rollNo.includes(search) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'gpa') cmp = a.gpa - b.gpa;
      else if (sortBy === 'attendance') cmp = a.attendance - b.attendance;
      else if (sortBy === 'class') cmp = a.class.localeCompare(b.class);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [search, classFilter, statusFilter, sortBy, sortDir]);

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
    <th onClick={() => toggleSort(field)} className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none">
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <span className="text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Students</h1>
          <p className="text-indigo-200 mt-1">Manage all students across classes</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or roll no..."
            className="w-full bg-[#0F172A] border border-white/[0.06] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="bg-[#0F172A] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0F172A] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl bg-white/[0.06] text-slate-400 text-sm hover:bg-white/[0.1] transition-colors flex items-center gap-1.5">
              <FiFilter size={14} /> Clear
            </button>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{selected.length} selected</span>
            <button className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/30 transition-colors">
              <FiMail size={16} />
            </button>
            <button className="p-2.5 rounded-xl bg-[#0F172A] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
              <FiDownload size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="hidden lg:block bg-[#0F172A] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="p-3 pl-5 w-12">
                  <input type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onChange={e => setSelected(e.target.checked ? filtered.map(s => s._id) : [])}
                    className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                  />
                </th>
                <SortHeader field="name">Student</SortHeader>
                <SortHeader field="class">Class</SortHeader>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Attendance</th>
                <SortHeader field="gpa">GPA</SortHeader>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Last Active</th>
                <th className="p-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3 pl-5">
                    <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)}
                      className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-400">{s.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-slate-300">{s.class}</span>
                    <span className="text-xs text-slate-600 ml-2">Roll: {s.rollNo}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/[0.06] rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${s.attendance >= 80 ? 'bg-emerald-500' : s.attendance >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className={`text-sm font-medium ${getAttendanceColor(s.attendance)}`}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${getGPAColor(s.gpa)}`}>{s.gpa}</span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyle(s.status)}`}>
                      {s.status === 'active' ? 'Active' : 'At Risk'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs ${s.lastActive.includes('d') ? 'text-slate-600' : 'text-slate-400'}`}>{s.lastActive}</span>
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/students/${s._id}`} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-indigo-400 transition-colors">
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
            <FiUser className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 text-sm">No students match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Clear filters</button>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-3">
        {filtered.map((s, i) => (
          <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.1] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-400">{s.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)}
                  className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                />
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyle(s.status)}`}>
                  {s.status === 'active' ? 'Active' : 'At Risk'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center">
              <div className="bg-white/[0.03] rounded-xl p-2">
                <p className="text-[10px] text-slate-500 mb-0.5">Class</p>
                <p className="text-sm text-white font-medium">{s.class}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2">
                <p className="text-[10px] text-slate-500 mb-0.5">GPA</p>
                <p className={`text-sm font-medium ${getGPAColor(s.gpa)}`}>{s.gpa}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2">
                <p className="text-[10px] text-slate-500 mb-0.5">Attendance</p>
                <p className={`text-sm font-medium ${getAttendanceColor(s.attendance)}`}>{s.attendance}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {s.lastActive.includes('d') ? (
                  <FiAlertTriangle size={12} className="text-rose-400" />
                ) : (
                  <FiCheckCircle size={12} className="text-emerald-400" />
                )}
                Active {s.lastActive}
              </div>
              <Link to={`/admin/students/${s._id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                View <FiChevronRight size={12} />
              </Link>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-8 text-center">
            <FiUser className="mx-auto text-slate-600 mb-3" size={28} />
            <p className="text-slate-500 text-sm">No students match your filters</p>
            <button onClick={clearFilters} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Clear filters</button>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {mockStudents.length} students</span>
          <span>{selected.length > 0 ? `${selected.length} selected` : ''}</span>
        </div>
      )}
    </div>
  );
};

export default StudentList;
