'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Payment, ChitGroup, User } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import FileUpload from '@/components/ui/FileUpload';
import { getMediaUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    user: '',
    chitgroup: '',
    amount_paid: '',
    payment_month: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const router = useRouter();

  // Filters
  const [filterGroup, setFilterGroup] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      let url = '/payments/?';
      if (filterGroup) url += `chitgroup=${filterGroup}&`;
      if (filterMonth) url += `payment_month=${filterMonth}-01&`;
      const res = await api.get(url);
      const data = res.data.results || res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterMonth]);

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
    fetchPayments();
    fetchMeta();
  }, [fetchPayments, fetchMeta]);

  const openCreate = () => {
    setForm({ user: '', chitgroup: '', amount_paid: '', payment_month: '' });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        user: parseInt(form.user),
        chitgroup: parseInt(form.chitgroup),
        payment_month: form.payment_month + '-01',
      };
      
      const res = await api.post('/payments/', payload);
      
      if (screenshotFile && res.data.id) {
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        await api.post(`/payments/${res.data.id}/upload-screenshot/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowCreateModal(false);
      setForm({ user: '', chitgroup: '', amount_paid: '', payment_month: '' });
      setScreenshotFile(null);
      setScreenshotPreview(null);
      fetchPayments();
    } catch (err) {
      console.error('Failed to create payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadScreenshot = async (file: File) => {
    if (!selectedPayment) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      await api.post(`/payments/${selectedPayment.id}/upload-screenshot/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowScreenshotModal(false);
      fetchPayments();
    } catch (err) {
      console.error('Failed to upload screenshot:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '₹0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${(isNaN(num) ? 0 : num).toLocaleString('en-IN')}`;
  };

  const columns = [
    ...(isAdmin
      ? [{
          key: 'user_detail',
          label: 'User',
          render: (p: Payment) => (
            <span style={{ fontWeight: 500, color: '#e2e8f0' }}>
              {p.user_detail?.full_name || p.user_detail?.username || `User #${p.user}`}
            </span>
          ),
        }]
      : []),
    {
      key: 'chitgroup_name',
      label: 'Group',
      render: (p: Payment) => p.chitgroup_name,
    },
    {
      key: 'amount_paid',
      label: 'Amount',
      render: (p: Payment) => (
        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
          {formatCurrency(p.amount_paid)}
        </span>
      ),
    },
    {
      key: 'payment_month',
      label: 'Month',
      render: (p: Payment) => (
        new Date(p.payment_month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      ),
    },
    {
      key: 'screenshot',
      label: 'Screenshot',
      render: (p: Payment) => (
        p.screenshot_full_url ? (
          <a
            href={p.screenshot_full_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-brand-400)', fontSize: 13, textDecoration: 'none' }}
          >
            📷 View
          </a>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(p);
              setShowScreenshotModal(true);
            }}
            style={{
              background: 'none',
              border: '1px dashed var(--color-glass-border)',
              color: '#64748b',
              padding: '2px 10px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            + Upload
          </button>
        )
      ),
    },
    {
      key: 'created_at',
      label: 'Recorded',
      render: (p: Payment) => (
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {new Date(p.created_at).toLocaleDateString('en-IN')}
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Payments</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
            {isAdmin ? 'Manage all payment records' : 'Your payment history'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            + Record Payment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card-static" style={{
        padding: '16px 20px',
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Filters:</span>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterGroup}
          onChange={(e) => { setFilterGroup(e.target.value); setLoading(true); }}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          className="form-input"
          type="month"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterMonth}
          onChange={(e) => { setFilterMonth(e.target.value); setLoading(true); }}
          placeholder="Filter by month"
        />
        {(filterGroup || filterMonth) && (
          <button
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => { setFilterGroup(''); setFilterMonth(''); setLoading(true); }}
          >
            Clear
          </button>
        )}
      </div>

      <DataTable<Payment>
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payments found"
        onRowClick={(p) => router.push(`/payments/${p.id}`)}
      />

      {/* Create Payment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Record Payment">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">User</label>
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
            <div className="responsive-grid-sm">
              <div>
                <label className="form-label">Amount Paid (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="5000"
                  value={form.amount_paid}
                  onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Payment Month</label>
                <input
                  className="form-input"
                  type="month"
                  value={form.payment_month}
                  onChange={(e) => setForm({ ...form, payment_month: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Screenshot (Optional)</label>
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
            <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Screenshot Modal */}
      <Modal
        isOpen={showScreenshotModal}
        onClose={() => setShowScreenshotModal(false)}
        title="Upload Payment Screenshot"
      >
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
          Upload a screenshot for payment #{selectedPayment?.id}
        </p>
        <FileUpload
          onFileSelect={handleUploadScreenshot}
          loading={uploading}
          accept="image/jpeg,image/png,image/webp"
        />
      </Modal>
    </div>
  );
}
