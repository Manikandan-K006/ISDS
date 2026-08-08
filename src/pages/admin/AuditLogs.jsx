import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiClock, FiChevronRight, FiShield } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { KpiCard } from '../../components/ui';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    API.get('/admin/audit-logs', { params: { page, limit: 50 } })
      .then(res => {
        setLogs(res.data?.logs || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <PageSkeleton />;

  const actionsLogged = new Set(logs.map(l => l.action).filter(Boolean)).size;

  const renderDetails = (details) => {
    if (!details) return null;
    const str = typeof details === 'string' ? details : JSON.stringify(details);
    return str.length > 80 ? `${str.slice(0, 80)}\u2026` : str;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Audit Logs</h1>
          <p className="theme-text mt-1">Track administrative actions across the system</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Total Logs" value={total} icon={FiActivity} color="indigo" />
        <KpiCard label="Actions on This Page" value={actionsLogged} icon={FiClock} color="amber" />
      </div>

      {logs.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiShield className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No audit logs found</p>
          <p className="theme-text-muted text-sm mt-1">Admin actions will be logged here.</p>
        </div>
      ) : (
        <>
          <div className="theme-card border theme-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="p-3 pl-5 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Time</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Admin</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Action</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Resource</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Details</th>
                    <th className="p-3 pr-5 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b theme-border hover:theme-subtle transition-colors"
                    >
                      <td className="p-3 pl-5 whitespace-nowrap">
                        <span className="text-xs theme-text-muted">{l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">{l.admin?.name || l.admin?.email || '\u2014'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {l.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs theme-text">
                          {l.resource}
                          {l.resourceId && <span className="theme-text-muted font-mono ml-1">#{l.resourceId}</span>}
                        </span>
                      </td>
                      <td className="p-3 max-w-[220px]">
                        {renderDetails(l.details) ? (
                          <span className="text-xs theme-text-muted font-mono break-all">{renderDetails(l.details)}</span>
                        ) : (
                          <span className="text-xs theme-text-muted">{'\u2014'}</span>
                        )}
                      </td>
                      <td className="p-3 pr-5">
                        <span className="text-xs theme-text-muted font-mono">{l.ipAddress || '\u2014'}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs theme-text-muted">
            <span>Showing {logs.length} of {total} logs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg theme-card border theme-border hover:bg-[var(--hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <FiChevronRight size={14} className="rotate-180" /> Prev
              </button>
              <span>Page {page} of {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg theme-card border theme-border hover:bg-[var(--hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
