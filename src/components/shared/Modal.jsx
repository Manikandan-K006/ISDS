import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} theme-card border theme-border rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className="flex items-center justify-between p-5 border-b theme-border">
              <h2 className="text-lg font-semibold theme-text">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
