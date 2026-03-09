import { useNavigate } from 'react-router-dom';
import { isLoggedIn, getRole, dashboardFor, logout } from '../utils/auth';

export default function Unauthorized() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (isLoggedIn()) {
      navigate(dashboardFor(getRole()), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <svg
          className="unauthorized-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        <h1 className="unauthorized-title">Access Denied</h1>
        <p className="unauthorized-desc">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary btn-block" onClick={goToDashboard}>
            Go to Dashboard
          </button>
          <button className="btn btn-block" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
