import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

export default function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      setLoading(false);
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      setLoading(false);
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must not be before start date');
      setLoading(false);
      return;
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      setError('Budget must be non-negative');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };

      // DEV: temporary debugging log
      console.log('Create Project Payload', payload);

      const response = await api.post('/api/projects', payload);

      // DEV: temporary debugging log
      console.log('Create Project Response', response);

      setSuccess('Project created successfully!');
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/admin/projects');
      }, 1500);
    } catch (err: unknown) {
      // DEV: temporary debugging log
      console.error('Create Project Error', err);

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
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Create New Project</h1>
        <p className="page-subtitle">Add a new construction project to the system</p>
      </div>

      <div className="section">
        <div className="card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <h2>Project Details</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={styles.form}>
              {error && <div style={styles.alertError}>{error}</div>}
              {success && <div style={styles.alertSuccess}>{success}</div>}

              <div style={styles.grid}>
                {/* Project Name */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Project Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    style={styles.input}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Location */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Location <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter project location"
                    style={styles.input}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description (optional)"
                  style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div style={styles.grid}>
                {/* Budget */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Budget (NPR)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={styles.input}
                    disabled={loading}
                    min="0"
                    step="0.01"
                  />
                </div>

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
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.grid}>
                {/* Start Date */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Start Date <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                    required
                  />
                </div>

                {/* End Date */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    End Date <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => navigate('/admin/projects')}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Project'}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#0A0A0A',
  },
  required: {
    color: '#d9534f',
  },
  input: {
    padding: '12px 16px',
    fontSize: '1rem',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: '#FCFCFC',
    color: '#0A0A0A',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },
  submitButton: {
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#1B3866',
    color: '#FCFCFC',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  cancelButton: {
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: 'transparent',
    color: '#5C5C5C',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  alertError: {
    padding: '12px 16px',
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    color: '#c9302c',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '1px solid rgba(217, 83, 79, 0.2)',
  },
  alertSuccess: {
    padding: '12px 16px',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    color: '#1e7e34',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '1px solid rgba(40, 167, 69, 0.2)',
  },
};
