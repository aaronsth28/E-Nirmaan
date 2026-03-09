import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

interface Engineer {
  id: number;
  name: string;
}

interface TaskFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo: string;
}

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

export default function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED',
    assignedTo: '',
  });

  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const res = await api.get('/api/users?role=SITE_ENGINEER');
        setEngineers(res.data.data);
      } catch {
        // Engineers list is optional – form still works without it
      }
    };
    fetchEngineers();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must not be before start date');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo, 10) : null,
      };

      await api.post(`/api/projects/${projectId}/tasks`, payload);
      setSuccess('Task created successfully!');

      setTimeout(() => {
        navigate(`/admin/projects/${projectId}/tasks`);
      }, 1500);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError(
          (err as { response: { data: { message: string } } }).response.data.message
        );
      } else {
        setError('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Create New Task</h1>
        <p className="page-subtitle">Add a task to project #{projectId}</p>
      </div>

      <div className="section">
        <div className="card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <h2>Task Details</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={styles.form}>
              {error && <div style={styles.alertError}>{error}</div>}
              {success && <div style={styles.alertSuccess}>{success}</div>}

              {/* Title */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Title <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description (optional)"
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' as const }}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div style={styles.grid}>
                {/* Status */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Assign To */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  >
                    <option value="">— Unassigned —</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.grid}>
                {/* Start Date */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                {/* End Date */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/projects/${projectId}/tasks`)}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton} disabled={loading}>
                  {loading ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 500, fontSize: '0.9rem', color: '#0A0A0A' },
  required: { color: '#d9534f' },
  input: {
    padding: '12px 16px', fontSize: '1rem',
    border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px',
    backgroundColor: '#FCFCFC', color: '#0A0A0A',
    outline: 'none', width: '100%', fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px',
    marginTop: '12px', paddingTop: '20px', borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },
  submitButton: {
    padding: '12px 32px', fontSize: '1rem', fontWeight: 600,
    backgroundColor: '#1B3866', color: '#FCFCFC', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
  },
  cancelButton: {
    padding: '12px 32px', fontSize: '1rem', fontWeight: 500,
    backgroundColor: 'transparent', color: '#5C5C5C',
    border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px', cursor: 'pointer',
  },
  alertError: {
    padding: '12px 16px', backgroundColor: 'rgba(217, 83, 79, 0.1)',
    color: '#c9302c', borderRadius: '8px', fontSize: '0.9rem',
    border: '1px solid rgba(217, 83, 79, 0.2)',
  },
  alertSuccess: {
    padding: '12px 16px', backgroundColor: 'rgba(40, 167, 69, 0.1)',
    color: '#1e7e34', borderRadius: '8px', fontSize: '0.9rem',
    border: '1px solid rgba(40, 167, 69, 0.2)',
  },
};
