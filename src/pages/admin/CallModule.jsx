import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPhone, FiMessageSquare, FiCalendar, FiUser, FiMail, FiClock } from 'react-icons/fi';

const mockParents = [
  { _id: 'p1', studentName: 'Arjun Sharma', className: '10A', parentName: 'Mr. Sharma', phone: '+91 98765 43210', email: 'sharma@email.com', lastContacted: '2026-05-20' },
  { _id: 'p2', studentName: 'Priya Patel', className: '10A', parentName: 'Mrs. Patel', phone: '+91 98765 43211', email: 'patel@email.com', lastContacted: '2026-05-15' },
  { _id: 'p3', studentName: 'Rahul Singh', className: '10B', parentName: 'Mr. Singh', phone: '+91 98765 43212', email: 'singh@email.com', lastContacted: '2026-05-22' },
];

const CallModule = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [selectedParent, setSelectedParent] = useState(null);
  const [message, setMessage] = useState('');

  const filtered = mockParents.filter(p => {
    if (classFilter !== 'All' && p.className !== classFilter) return false;
    if (search && !p.studentName.toLowerCase().includes(search.toLowerCase()) && !p.parentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Parent Communication</h1>
        <p className="text-slate-300 mt-1">Call, message, and manage parent communications</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or parent name..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All">All Classes</option>
          <option value="9A">9A</option>
          <option value="9B">9B</option>
          <option value="10A">10A</option>
          <option value="10B">10B</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(p => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-xl p-4 border cursor-pointer transition-all ${selectedParent?._id === p._id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'}`}
              onClick={() => setSelectedParent(p)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <FiUser className="text-indigo-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.parentName}</h3>
                    <p className="text-xs text-slate-500">Parent of {p.studentName} ({p.className})</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${p.phone}`} className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                    <FiPhone size={16} />
                  </a>
                  <button className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors">
                    <FiMessageSquare size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><FiMail size={12} /> {p.email}</span>
                <span className="flex items-center gap-1"><FiClock size={12} /> Last: {p.lastContacted}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {selectedParent ? (
            <>
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Contact Details</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-slate-400">Parent:</span> <span className="text-white">{selectedParent.parentName}</span></div>
                  <div><span className="text-slate-400">Student:</span> <span className="text-white">{selectedParent.studentName}</span></div>
                  <div><span className="text-slate-400">Class:</span> <span className="text-white">{selectedParent.className}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <a href={`tel:${selectedParent.phone}`} className="text-indigo-400 hover:text-indigo-300">{selectedParent.phone}</a></div>
                  <div><span className="text-slate-400">Email:</span> <span className="text-white">{selectedParent.email}</span></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <a href={`tel:${selectedParent.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/30 transition-colors">
                    <FiPhone size={16} /> Quick Call
                  </a>
                  <button className="flex-1 py-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-sm hover:bg-indigo-500/30 transition-colors">
                    <FiCalendar size={16} /> Schedule
                  </button>
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Send Message</h3>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <button className="mt-2 w-full py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium">
                  Send Message
                </button>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl p-5 text-center text-slate-500">
              <FiUser className="mx-auto mb-2" size={24} />
              <p className="text-sm">Select a parent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModule;
