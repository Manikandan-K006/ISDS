import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBookOpen, FiVideo, FiFileText, FiBook, FiClipboard, FiExternalLink, FiLoader } from 'react-icons/fi';
import { getCourses } from '../../api/courses';

const typeIcons = {
  video: FiVideo,
  article: FiFileText,
  book: FiBook,
  practice: FiClipboard,
  reference: FiBookOpen,
};

const typeColors = {
  video: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  article: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  book: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  practice: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  reference: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

const KnowledgeHub = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(data => { setCourses(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resources = courses.map(c => ({
    id: c._id,
    title: c.title,
    description: c.description || c.domain || '',
    category: c.domain || 'General',
    type: c.type || 'article',
    tags: [c.domain, c.level].filter(Boolean),
    url: c.resources?.length ? c.resources[0].url : '#',
  }));

  const CATEGORIES = ['All', ...new Set(courses.map(c => c.domain).filter(Boolean))];

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="space-y-6">
      <div className="animate-pulse theme-card rounded-2xl p-6 lg:p-8 border theme-border">
        <div className="h-7 w-48 theme-subtle rounded mb-2" />
        <div className="h-4 w-64 theme-subtle rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse theme-card rounded-2xl border theme-border p-5">
            <div className="w-12 h-12 rounded-xl theme-subtle mb-3" />
            <div className="h-4 w-3/4 theme-subtle rounded mb-2" />
            <div className="h-3 w-full theme-subtle rounded mb-1" />
            <div className="h-3 w-2/3 theme-subtle rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!loading && courses.length === 0) return (
    <div className="space-y-6">
      <div className="theme-card rounded-2xl p-6 lg:p-8 border theme-border">
        <h1 className="text-2xl lg:text-3xl font-bold theme-text">Knowledge Hub</h1>
        <p className="theme-text-muted mt-1">Explore learning resources curated for you</p>
      </div>
      <div className="theme-card rounded-2xl border theme-border p-12 text-center">
        <FiBookOpen className="mx-auto theme-text-muted mb-4" size={48} />
        <h3 className="text-lg font-medium theme-text mb-1">No resources available</h3>
        <p className="text-sm theme-text-muted">Learning resources will appear here once courses are added.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card rounded-2xl p-6 lg:p-8 border theme-border"
      >
        <h1 className="text-2xl lg:text-3xl font-bold theme-text">Knowledge Hub</h1>
        <p className="theme-text-muted mt-1">Explore learning resources curated for you</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="theme-card rounded-2xl p-4 border theme-border flex-1"
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full theme-input border theme-border rounded-xl pl-10 pr-4 py-2.5 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'theme-subtle theme-text-muted border theme-border hover:bg-[var(--hover)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((resource, i) => {
              const Icon = typeIcons[resource.type] || FiBookOpen;
              const colors = typeColors[resource.type] || typeColors.article;
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="theme-card rounded-2xl border theme-border p-5 hover:border-[var(--border-light)] transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={colors.text} size={22} />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold theme-text mb-1">{resource.title}</h3>
                  <p className="text-xs theme-text-muted mb-3 flex-1">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {resource.tags.map(tag => (
                        <span key={tag} className="text-[10px] theme-text-muted theme-subtle px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={resource.url}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    >
                      View <FiExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="theme-card rounded-2xl border theme-border p-12 text-center"
          >
            <FiBookOpen className="mx-auto theme-text-muted mb-4" size={48} />
            <h3 className="text-lg font-medium theme-text mb-1">No resources found</h3>
            <p className="text-sm theme-text-muted">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeHub;
