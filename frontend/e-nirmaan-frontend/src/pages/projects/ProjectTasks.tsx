import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  assignedTo: number | null;
  assignedName: string | null;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  PLANNED: 'badge-primary',
  ACTIVE: 'badge-success',
  COMPLETED: 'badge-gold',
  ON_HOLD: 'badge-warning',
};

export default function ProjectTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      setTasks(res.data.data);
      setError('');
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/api/tasks/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Project Tasks</h1>
          <p className="page-subtitle">Tasks for project #{projectId}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/projects/${projectId}/tasks/create`)}
          >
            + New Task
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#E0A31C', color: '#0A0A0A', border: 'none' }}
            onClick={() => navigate(`/admin/projects/${projectId}/schedule`)}
          >
            Schedule
          </button>
          <button
            className="btn"
            style={{ backgroundColor: 'transparent', color: '#5C5C5C', border: '1px solid rgba(0,0,0,0.1)' }}
            onClick={() => navigate('/admin/projects')}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Tasks</h2>
            <span style={{ fontSize: '0.85rem', color: '#5C5C5C' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            {loading && <p style={{ color: '#5C5C5C' }}>Loading tasks…</p>}

            {error && (
              <div style={styles.alertError}>{error}</div>
            )}

            {!loading && !error && tasks.length === 0 && (
              <div style={styles.empty}>
                <p>No tasks found.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/admin/projects/${projectId}/tasks/create`)}
                  style={{ marginTop: '1rem' }}
                >
                  Create First Task
                </button>
              </div>
            )}

            {!loading && tasks.length > 0 && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned Engineer</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                        <td>{task.assignedName || '—'}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[task.status] || 'badge-primary'}`}>
                            {formatStatus(task.status)}
                          </span>
                        </td>
                        <td>{formatDate(task.startDate)}</td>
                        <td>{formatDate(task.endDate)}</td>
                        <td>
                          <button
                            className="btn btn-danger-sm"
                            onClick={() => setDeleteTarget(task)}
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
              <p>Are you sure you want to delete this task?</p>
              <p style={{ fontWeight: 600, marginTop: '8px' }}>{deleteTarget.title}</p>
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
