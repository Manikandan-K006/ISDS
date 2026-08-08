import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiTrash2, FiCheck } from 'react-icons/fi';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import { Card } from '../../components/ui';

const priorityStyle = (priority) => {
  if (priority === 'high') return 'bg-rose-500/10 text-rose-400';
  if (priority === 'medium') return 'bg-amber-500/10 text-amber-500';
  if (priority === 'low') return 'bg-emerald-500/10 text-emerald-400';
  return 'theme-subtle theme-text-muted';
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = filter === 'unread' ? { limit: 50, unread: true } : { limit: 50 };
        const res = await getNotifications(params);
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* silent */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title theme-text">Notifications</h1>
          <p className="theme-text-muted mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <FiCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-indigo-500/10 text-indigo-400' : 'theme-text-muted hover:theme-hover'
            }`}
          >
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse theme-card border theme-border rounded-xl p-4">
              <div className="h-4 bg-theme-hover rounded w-1/3 mb-2" />
              <div className="h-3 bg-theme-hover rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`p-4 transition-colors ${!n.isRead ? 'border-indigo-500/20' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                    <p className={`text-sm ${!n.isRead ? 'theme-text font-semibold' : 'theme-text-muted'}`}>
                      {n.title}
                    </p>
                    {n.priority && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${priorityStyle(n.priority)}`}>
                        {n.priority}
                      </span>
                    )}
                  </div>
                  {n.message && <p className="text-xs theme-text-muted">{n.message}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] theme-text-muted">{formatTime(n.createdAt)}</span>
                    {n.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full theme-subtle theme-text-muted capitalize">{n.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 theme-text-muted hover:text-indigo-400 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 theme-text-muted hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FiBell className="mx-auto theme-text-muted mb-4" size={48} />
          <h3 className="text-lg font-medium theme-text mb-1">No notifications</h3>
          <p className="text-sm theme-text-muted">
            {filter === 'unread' ? 'No unread notifications' : "You're all caught up"}
          </p>
        </Card>
      )}
    </motion.div>
  );
}
