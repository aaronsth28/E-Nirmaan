import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string | null;
  location: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: number;
  createdByName: string | null;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  PLANNED: 'badge-primary',
  ACTIVE: 'badge-success',
  COMPLETED: 'badge-gold',
  ON_HOLD: 'badge-warning',
};

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/projects');
      setProjects(res.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/api/projects/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">View and manage all construction projects</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/projects/create')}
        >
          + New Project
        </button>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Projects</h2>
            <span style={{ fontSize: '0.85rem', color: '#5C5C5C' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="card-body">
            {loading && <p style={{ color: '#5C5C5C' }}>Loading projects…</p>}

            {error && (
              <div style={styles.alertError}>{error}</div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div style={styles.empty}>
                <p>No projects found.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/projects/create')}
                  style={{ marginTop: '1rem' }}
                >
                  Create First Project
                </button>
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Location</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} onClick={() => navigate(`/admin/projects/${project.id}/tasks`)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600 }}>{project.name}</td>
                        <td>{project.location}</td>
                        <td>{formatBudget(project.budget)}</td>

                        <td>
                          <span className={`badge ${STATUS_BADGE[project.status] || 'badge-primary'}`}>
                            {formatStatus(project.status)}
                          </span>
                        </td>

                        <td>{formatDate(project.startDate)}</td>
                        <td>{formatDate(project.endDate)}</td>
                        <td>
                          <button
                            className="btn btn-danger-sm"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                          >
                            Delete
                          </button>
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

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this project?</p>
              <p style={{ fontWeight: 600, marginTop: '8px' }}>{deleteTarget.name}</p>
              <p style={{ fontSize: '0.85rem', color: '#5C5C5C', marginTop: '8px' }}>
                This will also delete all tasks associated with this project.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  alertError: {
    padding: '12px 16px',
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    color: '#c9302c',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '1px solid rgba(217, 83, 79, 0.2)',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#5C5C5C',
  },
};