/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advisorService, ChatMessage } from '../lib/advisorService';
import { authService } from '../lib/authService';
import { useSocket } from '../hooks/useSocket';

const suggestions = [
  "What's my balance?",
  'Transfer $100 to Ahmed',
  'Pay electricity bill',
  'Show my recent transactions',
  'How much did I spend this month?',
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useSocket({
    onTransactionCompleted: (data) => {
      setNotification(`✅ ${data.message}`);
      setTimeout(() => setNotification(null), 4000);
    },
    onTransactionFailed: (data) => {
      setNotification(`❌ ${data.message}`);
      setTimeout(() => setNotification(null), 4000);
    },
    onBalanceUpdated: (data) => {
      setNotification(`💰 ${data.message}`);
      setTimeout(() => setNotification(null), 4000);
    },
  });

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await advisorService.getHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            role: 'assistant',
            content:
              "Hi! I'm Finova AI 👋 I can help you transfer money, pay bills, check your balance, and more. Just tell me what you need!",
          },
        ]);
      }
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm Finova AI 👋 How can I help you today?",
        },
      ]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await advisorService.chat(text);
      const aiMsg: ChatMessage = { role: 'assistant', content: response.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
      };
      const errMsg: ChatMessage = {
        role: 'assistant',
        content:
          errorResponse.response?.data?.message ||
          'Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await advisorService.clearHistory();
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared! How can I help you?',
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={styles.page}>
      {notification && <div style={styles.notification}>{notification}</div>}

      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💳</div>
          <span style={styles.logoText}>Finova</span>
        </div>
        <nav style={styles.nav}>
          {[
            {
              icon: '🏠',
              label: 'Dashboard',
              path: '/dashboard',
              active: false,
            },
            { icon: '💬', label: 'AI Chat', path: '/chat', active: true },
          ].map((item) => (
            <button
              key={item.label}
              style={{
                ...styles.navItem,
                background: item.active ? '#1e3a5f' : 'transparent',
                color: item.active ? '#fff' : '#93b4e8',
              }}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={() => authService.logout()}>
          🚪 Sign out
        </button>
      </div>

      <div style={styles.chatArea}>
        <div style={styles.chatHeader}>
          <div style={styles.aiInfo}>
            <div style={styles.aiAvatar}>🤖</div>
            <div>
              <p style={styles.aiName}>Finova AI</p>
              <p style={styles.aiStatus}>● Online</p>
            </div>
          </div>
          <button style={styles.clearBtn} onClick={handleClearHistory}>
            Clear history
          </button>
        </div>

        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.aiAvatarSmall}>🤖</div>
              )}
              <div
                style={{
                  ...styles.bubble,
                  background: msg.role === 'user' ? '#1d4ed8' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#0f172a',
                  border:
                    msg.role === 'assistant' ? '0.5px solid #e2e8f0' : 'none',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={styles.aiAvatarSmall}>🤖</div>
              <div
                style={{
                  ...styles.bubble,
                  background: '#fff',
                  border: '0.5px solid #e2e8f0',
                }}
              >
                <span style={styles.typing}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {loading && (
          <div style={styles.loadingBar}>
            🤖 Finova AI is thinking... please wait
          </div>
        )}

        {messages.length <= 1 && (
          <div style={styles.suggestions}>
            {suggestions.map((s) => (
              <button
                key={s}
                style={styles.suggestionBtn}
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder="Ask me anything about your account..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: !input.trim() || loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            {loading ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    height: '100vh',
    background: '#f8fafc',
    position: 'relative',
  },
  notification: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    background: '#0f172a',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    zIndex: 999,
    maxWidth: '320px',
  },
  sidebar: {
    width: '220px',
    background: '#0a1628',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    gap: '2rem',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  logoText: { color: '#fff', fontSize: '18px', fontWeight: 500 },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#6b8fbf',
    fontSize: '14px',
    cursor: 'pointer',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  chatHeader: {
    background: '#fff',
    borderBottom: '0.5px solid #e2e8f0',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  aiAvatar: {
    width: '40px',
    height: '40px',
    background: '#eff6ff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  aiName: { fontSize: '15px', fontWeight: 500, color: '#0f172a' },
  aiStatus: { fontSize: '12px', color: '#16a34a', marginTop: '2px' },
  clearBtn: {
    background: 'transparent',
    border: '0.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '12px',
    color: '#64748b',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  aiAvatarSmall: {
    width: '28px',
    height: '28px',
    background: '#eff6ff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  typing: { color: '#94a3b8', fontSize: '13px' },
  suggestions: {
    padding: '0 1.5rem 1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  suggestionBtn: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer',
  },
  inputArea: {
    background: '#fff',
    borderTop: '0.5px solid #e2e8f0',
    padding: '1rem 1.5rem',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    border: '0.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#0f172a',
    background: '#f8fafc',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loadingBar: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8',
    padding: '8px',
    background: '#f8fafc',
    borderTop: '0.5px solid #e2e8f0',
  },
};
