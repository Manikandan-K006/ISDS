import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiDownload, FiMail, FiChevronRight } from 'react-icons/fi';

const mockStudents = [
  { _id: '1', name: 'Arjun Sharma', class: '10A', rollNo: '1012', attendance: 87, gpa: 3.6, credits: 28, lastActive: '2h ago', status: 'active' },
  { _id: '2', name: 'Priya Patel', class: '10A', rollNo: '1015', attendance: 92, gpa: 3.7, credits: 35, lastActive: '1h ago', status: 'active' },
  { _id: '3', name: 'Rahul Singh', class: '10B', rollNo: '1020', attendance: 90, gpa: 3.6, credits: 30, lastActive: '3h ago', status: 'active' },
  { _id: '4', name: 'Ananya Gupta', class: '9A', rollNo: '901', attendance: 98, gpa: 3.9, credits: 42, lastActive: '30m ago', status: 'active' },
  { _id: '5', name: 'Vikram Joshi', class: '10B', rollNo: '1025', attendance: 62, gpa: 2.1, credits: 12, lastActive: '2d ago', status: 'at-risk' },
  { _id: '6', name: 'Neha Kapoor', class: '9A', rollNo: '905', attendance: 68, gpa: 2.5, credits: 15, lastActive: '1d ago', status: 'at-risk' },
  { _id: '7', name: 'Rohit Kumar', class: '11A', rollNo: '1101', attendance: 58, gpa: 1.8, credits: 8, lastActive: '5d ago', status: 'at-risk' },
  { _id: '8', name: 'Sneha Reddy', class: '10A', rollNo: '1018', attendance: 95, gpa: 3.8, credits: 38, lastActive: '1h ago', status: 'active' },
  { _id: '9', name: 'Amit Verma', class: '9B', rollNo: '910', attendance: 85, gpa: 3.2, credits: 22, lastActive: '4h ago', status: 'active' },
  { _id: '10', name: 'Kavita Sharma', class: '11B', rollNo: '1110', attendance: 78, gpa: 3.0, credits: 20, lastActive: '1d ago', status: 'active' },
];

const StudentList = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState([]);

  const classes = ['All', '9A', '9B', '10A', '10B', '11A', '11B'];

  const filtered = mockStudents.filter(s => {
    if (classFilter !== 'All' && s.class !== classFilter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.rollNo.includes(search)) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Students</h1>
        <p className="text-slate-300 mt-1">Manage all students across classes</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll no..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
        >
          {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="at-risk">At Risk</option>
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm border border-indigo-500/20">
              <FiMail size={16} />
            </button>
            <button className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 text-sm border border-white/10">
              <FiDownload size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left"><input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? filtered.map(s => s._id) : [])} /></th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Student</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Class</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Attendance</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">GPA</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Credits</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Status</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Last Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)} className="rounded" /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-xs text-indigo-400 font-bold">{s.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white">{s.name}</p>
                        <p className="text-xs text-slate-500">Roll: {s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-300">{s.class}</td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${s.attendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="p-3 text-sm text-white">{s.gpa}</td>
                  <td className="p-3 text-sm text-slate-300">{s.credits}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-500">{s.lastActive}</td>
                  <td className="p-3">
                    <Link to={`/admin/students/${s._id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                      View <FiChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
