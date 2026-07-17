/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail('demo@finova.app');
    setPassword('demo123');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftBg} />
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💳</div>
          <span style={styles.logoText}>Finova</span>
        </div>
        <div style={styles.leftContent}>
          <p style={styles.leftTagline}>AI Banking</p>
          <h1 style={styles.leftHeading}>
            Banking that <span style={styles.leftHeadingSpan}>understands</span>{' '}
            you
          </h1>
          <p style={styles.leftDesc}>
            Just type or speak — transfer money, pay bills, and check your
            balance through natural conversation.
          </p>
        </div>
        <div style={styles.features}>
          {[
            'Transfer money by chatting',
            'Real-time notifications under 100ms',
            '7 AI-powered banking tools',
          ].map((f) => (
            <div key={f} style={styles.feature}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.aiBadge}>
            <div style={styles.aiBadgeDot} />
            <span style={styles.aiBadgeText}>AI-powered banking</span>
          </div>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>Sign in to your Finova account</p>

          {error && <div style={styles.errorMsg}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div style={styles.forgot}>
            <a href="#" style={styles.forgotLink}>
              Forgot password?
            </a>
          </div>
          <button
            style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>
          <button style={styles.btnDemo} onClick={handleDemo}>
            Try demo account
          </button>
          <p style={styles.signupText}>
            Don't have an account?{' '}
            <a href="#" style={styles.signupLink}>
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    width: '45%',
    background: '#0a1628',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 30% 60%, #1a3a6e 0%, #0a1628 70%)',
    zIndex: 0,
  },
  logo: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  logoText: { color: '#fff', fontSize: '20px', fontWeight: 500 },
  leftContent: { position: 'relative', zIndex: 1 },
  leftTagline: {
    color: '#93b4e8',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  leftHeading: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 500,
    lineHeight: 1.3,
    marginBottom: '1rem',
  },
  leftHeadingSpan: { color: '#60a5fa' },
  leftDesc: { color: '#6b8fbf', fontSize: '14px', lineHeight: 1.7 },
  features: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feature: { display: 'flex', alignItems: 'center', gap: '10px' },
  featureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2563eb',
    flexShrink: 0,
  },
  featureText: { color: '#93b4e8', fontSize: '13px' },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
    background: '#fff',
  },
  formCard: { width: '100%', maxWidth: '360px' },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#eff6ff',
    border: '0.5px solid #bfdbfe',
    borderRadius: '20px',
    padding: '4px 12px',
    marginBottom: '1.5rem',
  },
  aiBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2563eb',
  },
  aiBadgeText: { fontSize: '12px', color: '#1d4ed8', fontWeight: 500 },
  formTitle: {
    fontSize: '22px',
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '6px',
  },
  formSub: { fontSize: '14px', color: '#64748b', marginBottom: '2rem' },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    height: '40px',
    border: '0.5px solid #cbd5e1',
    borderRadius: '8px',
    background: '#fff',
    color: '#0f172a',
    fontSize: '14px',
    padding: '0 12px',
    outline: 'none',
  },
  forgot: { textAlign: 'right', marginTop: '-6px', marginBottom: '1rem' },
  forgotLink: { fontSize: '12px', color: '#2563eb', cursor: 'pointer' },
  btnPrimary: {
    width: '100%',
    height: '40px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '1.25rem 0',
  },
  dividerLine: { flex: 1, height: '0.5px', background: '#e2e8f0' },
  dividerText: { fontSize: '12px', color: '#94a3b8' },
  btnDemo: {
    width: '100%',
    height: '40px',
    background: '#f8fafc',
    border: '0.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer',
  },
  signupText: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '13px',
    color: '#64748b',
  },
  signupLink: { color: '#2563eb', fontWeight: 500, cursor: 'pointer' },
  errorMsg: {
    background: '#fef2f2',
    border: '0.5px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#dc2626',
    marginBottom: '1rem',
  },
};
