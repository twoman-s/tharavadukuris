'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get(`/auth/users/${userId}/`);
      setUser(res.data);
      setForm({
        username: res.data.username,
        email: res.data.email || '',
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone: res.data.phone || '',
        password: '',
        role: res.data.role,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
    fetchUser();
  }, [isAdmin, router, fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const payload = { ...form };
      if (!payload.password) {
        // @ts-expect-error Optional field removal
        delete payload.password;
      }
      
      await api.put(`/auth/users/${userId}/`, payload);
      router.push('/users');
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.detail || err.response?.data?.username?.[0] || 'Failed to update user. Check data.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      setSubmitting(true);
      try {
        await api.delete(`/auth/users/${userId}/`);
        router.push('/users');
      } catch (err) {
        console.error('Failed to delete user:', err);
        setSubmitting(false);
      }
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <CardSkeleton />
      </div>
    );
  }

  if (!user) return <div style={{ color: '#f87171' }}>User not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => router.push('/users')}
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
        >
          &larr; Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Edit User</h1>
      </div>

      <div className="glass-card-static" style={{ padding: 24, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
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
              <label className="form-label">Password (Leave blank to keep current)</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-glass-border)' }}>
            <button 
              type="button" 
              className="btn-danger" 
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete User
            </button>
            <div style={{ flex: 1 }} />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
