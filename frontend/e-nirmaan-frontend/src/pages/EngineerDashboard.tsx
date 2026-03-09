import { getUser } from '../utils/auth';

export default function EngineerDashboard() {
  const user = getUser();

  const actions = [
    {
      title: 'Request Materials',
      desc: 'Create a new material request for your site',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      title: 'View My Requests',
      desc: 'Track status of your material requests',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: 'Site Status',
      desc: 'Update current site progress and status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      title: 'Daily Report',
      desc: 'Submit your daily work progress report',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  const recentRequests = [
    { id: 'REQ-001', material: 'Cement (50kg bags)', qty: 100, status: 'Approved', date: '2026-02-27' },
    { id: 'REQ-002', material: 'Steel Bars (12mm)', qty: 50, status: 'Pending', date: '2026-02-26' },
    { id: 'REQ-003', material: 'Sand (cubic meters)', qty: 10, status: 'Delivered', date: '2026-02-25' },
  ];

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'Approved':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Delivered':
        return 'badge-primary';
      case 'Rejected':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name ?? 'Engineer'}</h1>
        <p className="page-subtitle">Manage your site materials and reports</p>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="section">
        <div className="grid grid-2">
          {actions.map((action, index) => (
            <button key={index} className="action-card">
              <div className="action-card-icon">{action.icon}</div>
              <div className="action-card-title">{action.title}</div>
              <div className="action-card-desc">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="section">
        <div className="card">
          <div className="card-header">
            <h2>Recent Requests</h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td>{req.material}</td>
                      <td>{req.qty}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
