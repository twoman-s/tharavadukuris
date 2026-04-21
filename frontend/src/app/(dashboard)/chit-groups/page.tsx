'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ChitGroup, User, PaginatedResponse } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

export default function ChitGroupsPage() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: '',
    total_amount: '',
    individual_chit_amount: '',
    start_date: '',
    end_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/chitgroups/');
      const data = res.data.results || res.data;
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openCreate = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/auth/users/');
        const data = res.data.results || res.data;
        setUsers(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    }
    setForm({ name: '', total_amount: '', individual_chit_amount: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/chitgroups/', form);
      setShowModal(false);
      fetchGroups();
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Group Name',
      render: (g: ChitGroup) => (
        <Link
          href={`/chit-groups/${g.id}`}
          style={{ color: 'var(--color-brand-400)', textDecoration: 'none', fontWeight: 500 }}
        >
          {g.name}
        </Link>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (g: ChitGroup) => formatCurrency(g.total_amount),
    },
    {
      key: 'individual_chit_amount',
      label: 'Per Chit',
      render: (g: ChitGroup) => formatCurrency(g.individual_chit_amount),
    },
    {
      key: 'total_members',
      label: 'Members',
      render: (g: ChitGroup) => (
        <span className="badge badge-blue">{g.total_members}</span>
      ),
    },
    {
      key: 'total_chits',
      label: 'Chits',
      render: (g: ChitGroup) => (
        <span className="badge badge-gold">{g.total_chits}</span>
      ),
    },
    {
      key: 'start_date',
      label: 'Duration',
      render: (g: ChitGroup) => (
        <span style={{ fontSize: 13 }}>
          {new Date(g.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          {' → '}
          {new Date(g.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ];

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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Chit Groups</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
            {isAdmin ? 'Manage all chit groups' : 'Your chit group memberships'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            + New Group
          </button>
        )}
      </div>

      <DataTable<ChitGroup>
        columns={columns}
        data={groups}
        loading={loading}
        emptyMessage="No chit groups found"
      />

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Chit Group">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Group Name</label>
              <input
                className="form-input"
                placeholder="e.g. Family Chit 2026"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">Total Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="500000"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Individual Chit Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="5000"
                  value={form.individual_chit_amount}
                  onChange={(e) => setForm({ ...form, individual_chit_amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
