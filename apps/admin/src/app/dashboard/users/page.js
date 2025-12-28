'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import api from '@/lib/axios';
import styles from './page.module.css';


export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    role: 'VIEWER', assignedRegions: []
  });
  const [error, setError] = useState('');
  const { admin: currentAdmin } = useAdminAuth();

  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) setAdmins(data.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/users', formData);
      setShowModal(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'VIEWER', assignedRegions: [] });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !currentStatus });
      fetchAdmins();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const roles = ['SUPER_ADMIN', 'MODERATOR', 'VIEWER', 'REGIONAL_ADMIN', 'VOUCHER_MANAGER'];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admin Users</h1>
        <button onClick={() => setShowModal(true)} className={styles.addBtn}>
          + Add Admin
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {admins.map(admin => (
            <div key={admin.id} className={styles.tableRow}>
              <span>{admin.first_name} {admin.last_name}</span>
              <span>{admin.email}</span>
              <span className={styles.role}>{admin.role}</span>
              <span className={admin.is_active ? styles.active : styles.inactive}>
                {admin.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={styles.actions}>
                {admin.role !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                    className={admin.is_active ? styles.deactivate : styles.activate}
                  >
                    {admin.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add New Admin</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  {roles.filter(r => r !== 'SUPER_ADMIN').map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
