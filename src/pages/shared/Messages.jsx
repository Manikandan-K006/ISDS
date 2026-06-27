import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare, FiUser, FiArrowLeft } from 'react-icons/fi';
import { getConversations, getConversation, sendMessage } from '../../api/messages';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui';
import { timeAgo, getInitials } from '../../utils/helpers';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const convs = await getConversations();
        setConversations(convs);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    (async () => {
      const msgs = await getConversation(activeUserId);
      setMessages(msgs);
    })();
  }, [activeUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || !activeUserId) return;
    try {
      const msg = await sendMessage({ toId: activeUserId, content: content.trim() });
      setMessages(prev => [...prev, msg]);
      setContent('');
    } catch { /* silent */ }
  };

  const activeConv = conversations.find(c => c.userId === activeUserId);

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      <div className="w-72 shrink-0 space-y-2 overflow-y-auto">
        <h2 className="text-sm font-semibold theme-text px-2 mb-3">Conversations</h2>
        {conversations.length > 0 ? (
          conversations.map(c => (
            <button
              key={c.userId}
              onClick={() => setActiveUserId(c.userId)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${activeUserId === c.userId ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:theme-hover border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full theme-subtle flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium theme-text-muted">{getInitials(c.userName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm theme-text font-medium truncate">{c.userName}</p>
                    {c.unread && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />}
                  </div>
                  <p className="text-xs theme-text-muted truncate mt-0.5">{c.lastMessage}</p>
                  <span className="text-[10px] theme-text-muted">{timeAgo(c.lastTime)}</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center py-10 px-4 text-center">
            <FiMessageSquare className="theme-text-muted mb-3" size={28} />
            <p className="text-sm theme-text-muted">{loading ? 'Loading...' : 'No conversations'}</p>
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {activeUserId ? (
          <>
            <div className="p-4 border-b theme-border flex items-center gap-3">
              <button className="lg:hidden p-1" onClick={() => setActiveUserId(null)}><FiArrowLeft size={16} /></button>
              <div className="w-8 h-8 rounded-full theme-subtle flex items-center justify-center">
                <span className="text-xs font-medium theme-text-muted">{getInitials(activeConv?.userName || '')}</span>
              </div>
              <div>
                <p className="text-sm font-medium theme-text">{activeConv?.userName || 'User'}</p>
                <p className="text-xs theme-text-muted capitalize">{activeConv?.userRole || ''}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMe = m.fromId === user?._id || m.fromId === user?.id;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-500 text-white' : 'theme-subtle theme-text'}`}>
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'theme-text-muted'}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t theme-border">
              <div className="flex gap-3">
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder-theme-muted"
                />
                <button onClick={handleSend} disabled={!content.trim()} className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageSquare className="mx-auto theme-text-muted mb-4" size={48} />
              <h3 className="text-lg font-medium theme-text mb-1">Messages</h3>
              <p className="text-sm theme-text-muted">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Messages;
