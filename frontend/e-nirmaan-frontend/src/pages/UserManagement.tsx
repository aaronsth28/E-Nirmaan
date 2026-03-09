import { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'badge-gold',
  STORE_MANAGER: 'badge-primary',
  SITE_ENGINEER: 'badge-primary',
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SITE_ENGINEER',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(res.data.data);
      setError('');
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatRole = (role: string) => role.replace(/_/g, ' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (form.password !== form.confirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    try {
      setCreating(true);
      await api.post('/api/auth/users', form);
      setCreateSuccess('User created successfully!');
      setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'SITE_ENGINEER' });
      fetchUsers();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess('');
      }, 1200);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setCreateSuccess('');
    setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'SITE_ENGINEER' });
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create User
        </button>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>All Users</h2>
            <span style={{ fontSize: '0.85rem', color: '#5C5C5C' }}>
              {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            {loading && <p style={{ color: '#5C5C5C' }}>Loading users…</p>}

            {error && <div className="alert-error">{error}</div>}

            {!loading && !error && users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#5C5C5C' }}>
                <p>No users found.</p>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginTop: '1rem' }}>
                  Create First User
                </button>
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600 }}>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${ROLE_BADGE[user.role] || 'badge-primary'}`}>
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {createError && <div className="alert-error">{createError}</div>}
                {createSuccess && <div className="alert-success">{createSuccess}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="form-input" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required className="form-input" placeholder="Min 8 chars, upper, lower, number, special" />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select name="role" value={form.role} onChange={handleChange} className="form-input">
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
