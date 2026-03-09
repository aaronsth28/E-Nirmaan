import { useNavigate } from 'react-router-dom';
import { getUser, getRole, logout } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const formatRole = (r: string | null): string => {
    if (!r) return '';
    return r.replace(/_/g, ' ');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        E-Nirmaan
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="navbar-user-name">{user?.name}</span>
          <span className="role-badge">{formatRole(role)}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
