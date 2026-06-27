import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiTrash2, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../../api/notifications';
import { Card } from '../../components/ui';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = filter === 'unread' ? { limit: 50, unread: true } : { limit: 50 };
        const [notifRes, countRes] = await Promise.all([
          getNotifications(params),
          getUnreadCount(),
        ]);
        setNotifications(notifRes.data.notifications || []);
        setUnreadCount(countRes.data?.count || 0);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* silent */ }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:theme-hover theme-text-muted hover:theme-text transition-colors">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold theme-text">Notifications</h1>
            <p className="text-sm theme-text-muted mt-0.5">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5">
            <FiCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'theme-text-muted hover:theme-hover'
            }`}
          >
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse theme-card border theme-border rounded-xl p-4">
              <div className="h-4 bg-theme-hover rounded w-1/3 mb-2" />
              <div className="h-3 bg-theme-hover rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-2">
          {notifications.map(n => (
            <Card
              key={n._id}
              className={`p-4 transition-colors ${!n.isRead ? 'border-indigo-500/20' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                    <p className={`text-sm ${!n.isRead ? 'theme-text font-semibold' : 'theme-text-muted'}`}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-xs theme-text-muted line-clamp-2 ml-4">{n.message}</p>
                  <span className="text-[10px] theme-text-muted mt-1.5 ml-4 block">{formatTime(n.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 theme-text-muted hover:text-indigo-400 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 theme-text-muted hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      ) : (
        <Card className="p-12 text-center">
          <FiBell className="mx-auto theme-text-muted mb-4" size={48} />
          <h3 className="text-lg font-medium theme-text mb-1">No notifications</h3>
          <p className="text-sm theme-text-muted">
            {filter === 'unread' ? 'No unread notifications' : "You're all caught up"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
