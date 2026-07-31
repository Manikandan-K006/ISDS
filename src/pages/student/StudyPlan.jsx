import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { Calendar, BookOpen } from 'lucide-react';

export default function StudyPlan() {
  const [plan, setPlan] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    API.get('/ai/study-plan')
      .then(({ data }) => setPlan(data.plan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">AI Study Plan</h1>
      {plan?.schedule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(plan.schedule).map(([day, tasks]) => (
            <div key={day} className="theme-card rounded-2xl p-5 card-shadow">
              <h3 className="text-sm font-semibold theme-text capitalize mb-3">{day}</h3>
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:theme-hover text-sm">
                  <Calendar size={14} className="theme-text-muted" />
                  <span className="theme-text-muted">{task.time}</span>
                  <span className="theme-text">{task.task}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <BookOpen size={48} className="mx-auto theme-text-muted mb-4" />
          <p className="theme-text-muted">Study plan will be generated based on your courses</p>
        </div>
      )}
    </motion.div>
  );
}