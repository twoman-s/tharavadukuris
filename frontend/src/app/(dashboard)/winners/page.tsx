'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { MonthlyChitWinner, ChitGroup, User } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export default function WinnersPage() {
  const { isAdmin } = useAuth();
  const [winners, setWinners] = useState<MonthlyChitWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    user: '',
    chitgroup: '',
    total_amount_won: '',
    month: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const router = useRouter();

  const fetchWinners = useCallback(async () => {
    try {
      const res = await api.get('/winners/');
      const data = res.data.results || res.data;
      setWinners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch winners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const gRes = await api.get('/chitgroups/');
      const gData = gRes.data.results || gRes.data;
      setGroups(Array.isArray(gData) ? gData : []);
      if (isAdmin) {
        const uRes = await api.get('/auth/users/');
        const uData = uRes.data.results || uRes.data;
        setUsers(Array.isArray(uData) ? uData : []);
      }
    } catch { /* ignore */ }
  }, [isAdmin]);

  useEffect(() => {
    fetchWinners();
    fetchMeta();
  }, [fetchWinners, fetchMeta]);

  const openCreate = () => {
    setForm({ user: '', chitgroup: '', total_amount_won: '', month: '' });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        user: parseInt(form.user),
        chitgroup: parseInt(form.chitgroup),
        total_amount_won: form.total_amount_won,
        month: form.month,
      };
      const res = await api.post('/winners/', payload);
      
      if (screenshotFile && res.data.id) {
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        await api.post(`/winners/${res.data.id}/upload-screenshot/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      setForm({ user: '', chitgroup: '', total_amount_won: '', month: '' });
      setScreenshotFile(null);
      setScreenshotPreview(null);
      fetchWinners();
    } catch (err) {
      console.error('Failed to save winner:', err);
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
      key: 'month',
      label: 'Month',
      render: (w: MonthlyChitWinner) => {
        const [y, m] = w.month.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      },
    },
    {
      key: 'user_detail',
      label: 'Winner',
      render: (w: MonthlyChitWinner) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{ fontWeight: 600, color: 'var(--color-brand-300)' }}>
            {w.user_detail?.full_name || w.user_detail?.username || `User #${w.user}`}
          </span>
        </div>
      ),
    },
    {
      key: 'chitgroup_name',
      label: 'Group',
    },
    {
      key: 'total_amount_won',
      label: 'Amount Won',
      render: (w: MonthlyChitWinner) => (
        <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: 15 }}>
          {formatCurrency(w.total_amount_won)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Recorded',
      render: (w: MonthlyChitWinner) => (
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {new Date(w.created_at).toLocaleDateString('en-IN')}
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Winners</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
            Monthly chit fund winners
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            + Allocate Winner
          </button>
        )}
      </div>

      <DataTable<MonthlyChitWinner>
        columns={columns}
        data={winners}
        loading={loading}
        emptyMessage="No winners allocated yet"
        onRowClick={(w) => router.push(`/winners/${w.id}`)}
      />

      {/* Allocate Winner Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Allocate Monthly Winner">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Chit Group</label>
              <select
                className="form-select"
                value={form.chitgroup}
                onChange={(e) => setForm({ ...form, chitgroup: e.target.value })}
                required
              >
                <option value="">Select group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Winner</label>
              <select
                className="form-select"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                required
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">Amount Won (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="450000"
                  value={form.total_amount_won}
                  onChange={(e) => setForm({ ...form, total_amount_won: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Month (YYYY-MM)</label>
                <input
                  className="form-input"
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Payment Confirmation (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setScreenshotFile(file);
                    setScreenshotPreview(URL.createObjectURL(file));
                  }
                }}
                className="form-input"
                style={{ padding: '6px 14px' }}
              />
              {screenshotPreview && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              )}
            </div>

          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Allocate Winner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
