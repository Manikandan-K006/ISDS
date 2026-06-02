import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClipboard, FiClock, FiCheckCircle, FiAlertCircle, FiFileText, FiFilter } from 'react-icons/fi';
import { MOCK_ASSIGNMENTS } from '../../utils/constants';
import { formatDateTime, getDeadlineStatus } from '../../utils/helpers';

const tabs = ['Pending', 'Submitted', 'Graded'];

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_ASSIGNMENTS.filter(a => a.status === activeTab.toLowerCase());

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Assignments</h1>
        <p className="text-slate-300 mt-1">Track and submit your assignments</p>
      </motion.div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(a => {
          const deadline = getDeadlineStatus(a.deadline);
          return (
            <motion.div
              key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-5 border border-white/10 hover:border-indigo-500/20 transition-all cursor-pointer"
              onClick={() => setSelected(a)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <FiClipboard className="text-indigo-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                    <p className="text-xs text-slate-500">{a.courseName}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${deadline.color}`}>{deadline.label}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{a.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><FiFileText size={12} /> Max: {a.maxMarks}</span>
                {a.grade !== undefined && <span className="text-emerald-400">Grade: {a.grade}/{a.maxMarks}</span>}
              </div>
              {a.status === 'pending' && (
                <button className="mt-3 w-full py-2 rounded-lg gradient-accent text-white text-sm font-medium">
                  Submit Now
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Assignments;
