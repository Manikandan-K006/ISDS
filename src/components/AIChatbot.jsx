import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { sendMessage } from '../api/chatbot';

const quickReplies = [
  "What courses are available?",
  "Explain this topic",
  "When is my exam?",
  "How to improve my grade?",
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm ISDS Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendMessage({ message: msg, userId: user?._id });
      const reply = res.reply || res.message || "I'm here to help! Please ask me something.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here to help with your academic questions! You can ask me about courses, assignments, exam schedules, or any study-related topics." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-accent shadow-lg shadow-indigo-500/30 flex items-center justify-center theme-text z-50 hover:shadow-xl hover:shadow-indigo-500/40 transition-shadow"
      >
        <FiMessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] glass-dark border theme-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b theme-border bg-indigo-500/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <FiCpu className="text-indigo-400" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold theme-text">ISDS Assistant</h3>
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 theme-text-muted">
                <FiX size={18} />
              </button>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/20'
                      : 'theme-input theme-text border theme-border'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="theme-input theme-text-muted p-3 rounded-xl border theme-border text-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 theme-text-muted rounded-full animate-bounce" />
                      <span className="w-2 h-2 theme-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 theme-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t theme-border">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickReplies.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-2.5 py-1 rounded-full theme-input border theme-border theme-text-muted hover:bg-white/10 hover:theme-text transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 theme-input border theme-border rounded-lg px-3 py-2 text-sm theme-text placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <button onClick={() => handleSend()} className="p-2 rounded-lg gradient-accent theme-text">
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
