'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { ChitGroup, UserChitAllocation, User } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ChitGroupDetailPage() {
  const params = useParams();
  const groupId = params.id;
  const { isAdmin } = useAuth();
  const [group, setGroup] = useState<ChitGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allocForm, setAllocForm] = useState({ user: '', number_of_chits: '1' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    total_amount: '',
    individual_chit_amount: '',
    start_date: '',
    end_date: '',
  });

  const fetchGroup = useCallback(async () => {
    try {
      const res = await api.get(`/chitgroups/${groupId}/`);
      setGroup(res.data);
    } catch (err) {
      console.error('Failed to fetch group:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const openAddAllocation = async () => {
    try {
      const res = await api.get('/auth/users/');
      const data = res.data.results || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setAllocForm({ user: '', number_of_chits: '1' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditAllocation = async (a: UserChitAllocation) => {
    if (users.length === 0) {
      try {
        const res = await api.get('/auth/users/');
        const data = res.data.results || res.data;
        setUsers(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    }
    setEditingId(a.id);
    setAllocForm({ user: String(a.user), number_of_chits: String(a.number_of_chits) });
    setShowModal(true);
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        user: parseInt(allocForm.user),
        number_of_chits: parseInt(allocForm.number_of_chits),
        chitgroup: parseInt(groupId as string),
      };
      if (editingId) {
        await api.put(`/allocations/${editingId}/`, payload);
      } else {
        await api.post(`/chitgroups/${groupId}/allocations/`, payload);
      }
      setShowModal(false);
      fetchGroup();
    } catch (err) {
      console.error('Failed to add allocation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (allocId: number) => {
    if (!confirm('Remove this allocation?')) return;
    try {
      await api.delete(`/allocations/${allocId}/`);
      fetchGroup();
    } catch (err) {
      console.error('Failed to delete allocation:', err);
    }
  };

  const openEditGroup = () => {
    if (!group) return;
    setGroupForm({
      name: group.name,
      total_amount: String(group.total_amount),
      individual_chit_amount: String(group.individual_chit_amount),
      start_date: group.start_date,
      end_date: group.end_date,
    });
    setIsEditingGroup(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/chitgroups/${groupId}/`, groupForm);
      setIsEditingGroup(false);
      fetchGroup();
    } catch (err) {
      console.error('Failed to update group:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '₹0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${(isNaN(num) ? 0 : num).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div>
        <CardSkeleton />
        <div style={{ marginTop: 24 }}><CardSkeleton /></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="glass-card-static" style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 16 }}>Group not found</p>
      </div>
    );
  }

  const allocationColumns = [
    {
      key: 'user_detail',
      label: 'Member',
      render: (a: UserChitAllocation) => (
        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>
          {a.user_detail?.full_name || a.user_detail?.username || `User #${a.user}`}
        </span>
      ),
    },
    {
      key: 'number_of_chits',
      label: 'Chits',
      render: (a: UserChitAllocation) => (
        <span className="badge badge-gold">{a.number_of_chits}</span>
      ),
    },
    {
      key: 'total_chit_amount',
      label: 'Monthly Amount',
      render: (a: UserChitAllocation) => (
        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
          {formatCurrency(a.total_chit_amount)}
        </span>
      ),
    },
    ...(isAdmin
      ? [{
          key: 'actions',
          label: '',
          render: (a: UserChitAllocation) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => openEditAllocation(a)}
                className="btn-secondary"
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteAllocation(a.id)}
                className="btn-danger"
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                Remove
              </button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div>
      {/* Group header */}
      <div className="glass-card-static" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {isEditingGroup ? (
            <form onSubmit={handleUpdateGroup} style={{ width: '100%' }}>
              <div className="responsive-grid" style={{ gap: 16 }}>
                <div>
                  <label className="form-label">Name</label>
                  <input className="form-input" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Total Amount</label>
                  <input className="form-input" type="number" step="0.01" value={groupForm.total_amount} onChange={e => setGroupForm({...groupForm, total_amount: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Per Chit Amount</label>
                  <input className="form-input" type="number" step="0.01" value={groupForm.individual_chit_amount} onChange={e => setGroupForm({...groupForm, individual_chit_amount: e.target.value})} required />
                </div>
                <div className="responsive-grid-sm" style={{ gap: 8 }}>
                  <div>
                    <label className="form-label">Start Date</label>
                    <input className="form-input" type="date" value={groupForm.start_date} onChange={e => setGroupForm({...groupForm, start_date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input className="form-input" type="date" value={groupForm.end_date} onChange={e => setGroupForm({...groupForm, end_date: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn-primary" disabled={submitting}>Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setIsEditingGroup(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{group.name}</h1>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#94a3b8', fontSize: 14 }}>
                  <span>Total: <strong style={{ color: '#e2e8f0' }}>{formatCurrency(group.total_amount)}</strong></span>
                  <span>Per Chit: <strong style={{ color: '#e2e8f0' }}>{formatCurrency(group.individual_chit_amount)}</strong></span>
                  <span>Members: <strong style={{ color: '#e2e8f0' }}>{group.total_members}</strong></span>
                  <span>Chits: <strong style={{ color: '#e2e8f0' }}>{group.total_chits}</strong></span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  {new Date(group.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' → '}
                  {new Date(group.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              
              {isAdmin && (
                <button onClick={openEditGroup} className="btn-secondary" style={{ padding: '6px 16px', fontSize: 13 }}>
                  Edit Group Details
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Allocations */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>Member Allocations</h2>
        {isAdmin && (
          <button className="btn-primary" onClick={openAddAllocation}>
            + Add Member
          </button>
        )}
      </div>

      <DataTable<UserChitAllocation>
        columns={allocationColumns}
        data={group.allocations || []}
        emptyMessage="No members allocated yet"
      />

      {/* Add/Edit Allocation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Member Allocation" : "Add Member Allocation"}>
        <form onSubmit={handleAddAllocation}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Select User</label>
              <select
                className="form-select"
                value={allocForm.user}
                onChange={(e) => setAllocForm({ ...allocForm, user: e.target.value })}
                required
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Number of Chits</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="1"
                value={allocForm.number_of_chits}
                onChange={(e) => setAllocForm({ ...allocForm, number_of_chits: e.target.value })}
                required
              />
              {allocForm.number_of_chits && group.individual_chit_amount && (
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                  Monthly contribution: <strong style={{ color: 'var(--color-brand-400)' }}>
                    {formatCurrency(parseInt(allocForm.number_of_chits) * parseFloat(group.individual_chit_amount))}
                  </strong>
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (editingId ? 'Update Member' : 'Add Member')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
