import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { setAuth, isLoggedIn, getRole, dashboardFor } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoggedIn()) {
    return <Navigate to={dashboardFor(getRole())} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setAuth(data.data.user, data.data.token);
      navigate(dashboardFor(data.data.user.role), { replace: true });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError(
          (err as { response: { data: { message: string } } }).response.data.message,
        );
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-panel">
        <div className="login-hero">
          <div className="login-logo-bg">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#E0A31C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="5" y1="12" x2="5" y2="6" />
              <line x1="19" y1="12" x2="19" y2="6" />
              <line x1="9" y1="12" x2="9" y2="8" />
              <line x1="15" y1="12" x2="15" y2="8" />
              <path d="M5 6h3v2H5z" />
              <path d="M16 6h3v2h-3z" />
              <path d="M9 8h6v2H9z" />
              <line x1="3" y1="18" x2="21" y2="18" />
              <line x1="3" y1="14" x2="21" y2="14" />
            </svg>
          </div>
          <div className="login-hero-content">
            <h1>E-Nirmaan</h1>
            <p>Construction Management System</p>
          </div>
        </div>
      </div>
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <div className="login-field-group">
            <label>Email Address</label>
            <div className="login-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-input-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>
          <div className="login-field-group">
            <label>Password</label>
            <div className="login-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <span className="login-btn-content">
                <span className="login-spinner" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <p className="login-footer">
          Secure access for authorized personnel only
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
