import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../lib/authService'
import { transactionService, Transaction } from '../lib/transactionService'
import { useSocket } from '../hooks/useSocket'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)

  useSocket({
    onTransactionCompleted: (data) => {
      setNotification(`✅ ${data.message}`)
      loadTransactions()
      setTimeout(() => setNotification(null), 4000)
    },
    onTransactionFailed: (data) => {
      setNotification(`❌ ${data.message}`)
      setTimeout(() => setNotification(null), 4000)
    },
    onBalanceUpdated: (data) => {
      setNotification(`💰 ${data.message}`)
      loadTransactions()
      setTimeout(() => setNotification(null), 4000)
    },
  })

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAll()
      setTransactions(data)
    } catch (e) {
      console.error('Failed to load transactions', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authService.isLoggedIn()) { navigate('/login'); return }
    loadTransactions()
  }, [])

  const totalBalance = transactions.reduce((sum, t) => {
    return t.type === 'credit' ? sum + t.amount : sum - t.amount
  }, 0)

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
            { icon: '🏠', label: 'Dashboard', path: '/dashboard', active: true },
            { icon: '💬', label: 'AI Chat', path: '/chat', active: false },
          ].map((item) => (
            <button key={item.label} style={{ ...styles.navItem, background: item.active ? '#1e3a5f' : 'transparent', color: item.active ? '#fff' : '#93b4e8' }}
              onClick={() => navigate(item.path)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={() => authService.logout()}>🚪 Sign out</button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Welcome back, {user?.name || 'there'} 👋</p>
          </div>
          <button style={styles.chatBtn} onClick={() => navigate('/chat')}>💬 Ask AI</button>
        </div>

        <div style={styles.balanceCard}>
          <p style={styles.balanceLabel}>Total Balance</p>
          <h2 style={styles.balanceAmount}>
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div style={styles.balanceActions}>
            <button style={styles.actionBtn} onClick={() => navigate('/chat')}>↑ Send</button>
            <button style={styles.actionBtn} onClick={() => navigate('/chat')}>💬 AI Chat</button>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent transactions</h3>
          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>No transactions yet. Try asking the AI to make a transfer!</p>
          ) : (
            <div style={styles.transactionList}>
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} style={styles.transactionItem}>
                  <div style={styles.txLeft}>
                    <div style={{ ...styles.txIcon, background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2' }}>
                      {tx.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p style={styles.txName}>{tx.description}</p>
                      <p style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p style={{ ...styles.txAmount, color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#f8fafc', position: 'relative' },
  notification: { position: 'fixed', top: '1rem', right: '1rem', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 999, maxWidth: '320px' },
  sidebar: { width: '220px', background: '#0a1628', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', gap: '2rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  logoText: { color: '#fff', fontSize: '18px', fontWeight: 500 },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'pointer', textAlign: 'left' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#6b8fbf', fontSize: '14px', cursor: 'pointer' },
  main: { flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: '22px', fontWeight: 500, color: '#0f172a' },
  pageSubtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  chatBtn: { background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  balanceCard: { background: '#0a1628', borderRadius: '16px', padding: '2rem', color: '#fff' },
  balanceLabel: { fontSize: '13px', color: '#93b4e8', marginBottom: '8px' },
  balanceAmount: { fontSize: '36px', fontWeight: 500, marginBottom: '1.5rem' },
  balanceActions: { display: 'flex', gap: '12px' },
  actionBtn: { background: '#1e3a5f', color: '#93b4e8', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e2e8f0' },
  sectionTitle: { fontSize: '15px', fontWeight: 500, color: '#0f172a', marginBottom: '1rem' },
  transactionList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  transactionItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid #f1f5f9' },
  txLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  txIcon: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  txName: { fontSize: '14px', fontWeight: 500, color: '#0f172a' },
  txDate: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  txAmount: { fontSize: '14px', fontWeight: 500 },
}
