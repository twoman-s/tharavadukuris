'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
  }, [isAdmin, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users/');
      const data = res.data.results || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const openCreate = () => {
    setForm({ username: '', email: '', first_name: '', last_name: '', phone: '', password: '', role: 'user' });
    setShowModal(true);
    setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/users/', form);
      setShowModal(false);
      setForm({ username: '', email: '', first_name: '', last_name: '', phone: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr?.response?.data;
      if (data) {
        const firstErr = Object.values(data).flat()[0];
        setError(typeof firstErr === 'string' ? firstErr : 'Failed to create user');
      } else {
        setError('Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Username',
      render: (u: User) => (
        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{u.username}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (u: User) => (
        u.first_name ? `${u.first_name} ${u.last_name}` : '—'
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (u: User) => u.email || '—',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (u: User) => u.phone || '—',
    },
    {
      key: 'role',
      label: 'Role',
      render: (u: User) => (
        <span className={u.role === 'admin' ? 'badge badge-gold' : 'badge badge-blue'}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (u: User) => (
        <span className={u.is_active ? 'badge badge-green' : 'badge badge-red'}>
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'date_joined',
      label: 'Joined',
      render: (u: User) => (
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {new Date(u.date_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ];

  if (!isAdmin) return null;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Users</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
            Manage user accounts
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add User
        </button>
      </div>

      <DataTable<User>
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        onRowClick={(u) => router.push(`/users/${u.id}`)}
      />

      {/* Create User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  placeholder="John"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Username *</label>
              <input
                className="form-input"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Password *</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              marginTop: 16,
              fontSize: 13,
              color: '#f87171',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
