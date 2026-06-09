import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBookOpen, FiVideo, FiFileText, FiBook, FiClipboard, FiExternalLink } from 'react-icons/fi';

const resources = [
  { id: 1, title: 'Calculus Fundamentals', description: 'Comprehensive video series covering limits, derivatives, and integrals', category: 'Mathematics', type: 'video', tags: ['calculus', 'derivatives'], url: '#' },
  { id: 2, title: 'Quantum Mechanics Explained', description: 'Visual guide to quantum physics principles', category: 'Science', type: 'article', tags: ['quantum', 'physics'], url: '#' },
  { id: 3, title: 'Shakespeare: Complete Works', description: 'Analysis and summaries of major plays', category: 'Literature', type: 'book', tags: ['shakespeare', 'drama'], url: '#' },
  { id: 4, title: 'Python Programming Basics', description: 'Interactive coding exercises for beginners', category: 'Technology', type: 'practice', tags: ['python', 'coding'], url: '#' },
  { id: 5, title: 'Algebra Formula Sheet', description: 'Quick reference for all algebra formulas', category: 'Mathematics', type: 'reference', tags: ['algebra', 'formulas'], url: '#' },
  { id: 6, title: 'World History Timeline', description: 'Interactive timeline of major historical events', category: 'Literature', type: 'video', tags: ['history', 'timeline'], url: '#' },
  { id: 7, title: 'Biology Cell Structure', description: '3D interactive model of cell anatomy', category: 'Science', type: 'video', tags: ['biology', 'cells'], url: '#' },
  { id: 8, title: 'Web Development Roadmap', description: 'Step-by-step guide to becoming a web developer', category: 'Technology', type: 'article', tags: ['web', 'development'], url: '#' },
];

const CATEGORIES = ['All', 'Mathematics', 'Science', 'Literature', 'Technology', 'Arts'];

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

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06]"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Knowledge Hub</h1>
        <p className="text-slate-400 mt-1">Explore learning resources curated for you</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F172A] rounded-2xl p-4 border border-white/[0.06] flex-1"
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
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
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]'
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
                  className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={colors.text} size={22} />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{resource.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 flex-1">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {resource.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
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
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-12 text-center"
          >
            <FiBookOpen className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-1">No resources found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeHub;
