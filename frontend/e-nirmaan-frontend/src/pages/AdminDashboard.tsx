import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  activeProjects: number;
}

interface RecentProject {
  id: number;
  name: string;
  status: string;
  location: string;
  startDate: string;
}

const STATUS_BADGE: Record<string, string> = {
  PLANNED: 'badge-primary',
  ACTIVE: 'badge-success',
  COMPLETED: 'badge-gold',
  ON_HOLD: 'badge-warning',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalProjects: 0, totalTasks: 0, activeProjects: 0 });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/projects'),
        ]);

        const users = usersRes.data.data || [];
        const projects = projectsRes.data.data || [];
        const activeCount = projects.filter((p: any) => p.status === 'ACTIVE').length;

        // Fetch tasks count from all projects
        let totalTasks = 0;
        try {
          const taskPromises = projects.slice(0, 10).map((p: any) =>
            api.get(`/api/projects/${p.id}/tasks`).catch(() => ({ data: { data: [] } }))
          );
          const taskResults = await Promise.all(taskPromises);
          totalTasks = taskResults.reduce((sum, r) => sum + (r.data?.data?.length || 0), 0);
        } catch { /* ignore */ }

        setStats({ totalUsers: users.length, totalProjects: projects.length, totalTasks, activeProjects: activeCount });
        setRecentProjects(projects.slice(0, 5));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatRole = (role: string) => role.replace(/_/g, ' ');
  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total Projects', value: stats.totalProjects },
    { label: 'Active Projects', value: stats.activeProjects },
    { label: 'Total Tasks', value: stats.totalTasks },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and quick actions</p>
      </div>

      {/* Stats Grid */}
      <div className="section">
        <div className="grid grid-4">
          {statCards.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-value">{loading ? '—' : stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions + Recent Projects */}
      <div className="section">
        <div className="grid grid-2">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h2>Quick Actions</h2></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-primary btn-block" onClick={() => navigate('/admin/users')} style={{ justifyContent: 'flex-start', gap: '10px' }}>
                  <span>👤</span> Manage Users
                </button>
                <button className="btn btn-primary btn-block" onClick={() => navigate('/admin/projects/create')} style={{ justifyContent: 'flex-start', gap: '10px' }}>
                  <span>📁</span> Create New Project
                </button>
                <button className="btn btn-primary btn-block" onClick={() => navigate('/admin/projects')} style={{ justifyContent: 'flex-start', gap: '10px' }}>
                  <span>📋</span> View All Projects
                </button>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Recent Projects</h2>
              <button className="btn" style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'transparent', color: 'var(--primary-blue)', border: '1px solid var(--primary-blue)' }} onClick={() => navigate('/admin/projects')}>View All</button>
            </div>
            <div className="card-body">
              {loading && <p style={{ color: '#5C5C5C' }}>Loading…</p>}
              {!loading && recentProjects.length === 0 && (
                <p style={{ color: '#5C5C5C', textAlign: 'center', padding: '1rem' }}>No projects yet.</p>
              )}
              {!loading && recentProjects.length > 0 && (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProjects.map((p) => (
                        <tr key={p.id} onClick={() => navigate(`/admin/projects/${p.id}/tasks`)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>{p.location}</td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[p.status] || 'badge-primary'}`}>
                              {formatStatus(p.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
