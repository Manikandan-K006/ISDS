import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiRefreshCw, FiCheck, FiAlertTriangle, FiClock } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const DatabaseHealth = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/database-health');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load database health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (loading) return <PageSkeleton />;

  const isHealthy = !error && data?.status === 'healthy';
  const counts = data?.counts || {};

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Database Health</h1>
          <p className="theme-text mt-1">Monitor the health and record counts of the database</p>
        </div>
      </motion.div>

      <div className={`theme-card border rounded-2xl p-8 text-center ${isHealthy ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isHealthy ? <FiCheck size={32} /> : <FiAlertTriangle size={32} />}
        </div>
        <h2 className={`text-2xl font-bold mt-4 ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isHealthy ? 'Healthy' : error ? 'Connection Failed' : 'Issues Detected'}
        </h2>
        {error && <p className="text-sm theme-text-muted mt-2 break-all">{error}</p>}
        <p className="text-sm theme-text-muted mt-2 flex items-center justify-center gap-1.5">
          <FiClock size={14} />
          {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '\u2014'}
        </p>
        <button onClick={fetchHealth}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {!error && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(counts).map(([key, value]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
                <FiDatabase className="text-indigo-400" size={20} />
              </div>
              <p className="text-2xl font-bold theme-text">{value}</p>
              <p className="text-xs theme-text-muted mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseHealth;
