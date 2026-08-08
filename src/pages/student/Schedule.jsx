import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { Calendar } from 'lucide-react';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    API.get('/calendar').then(({ data }) => setEvents(data.events || [])).catch(() => {});
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Schedule</h1>
      <div className="theme-card rounded-2xl p-5 card-shadow">
        {events.length === 0 ? (
          <div className="text-center py-8"><Calendar size={32} className="mx-auto theme-text-muted mb-2" /><p className="theme-text-muted">No events scheduled</p></div>
        ) : events.map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-sm theme-text">{e.title}</p>
            <span className="text-xs theme-text-muted ml-auto">{new Date(e.startDate).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}