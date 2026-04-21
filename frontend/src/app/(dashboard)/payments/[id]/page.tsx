'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api, { getMediaUrl } from '@/lib/api';
import { Payment, ChitGroup, User } from '@/lib/types';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id;
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [form, setForm] = useState({
    user: '',
    chitgroup: '',
    amount_paid: '',
    payment_month: '',
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, gRes, uRes] = await Promise.all([
        api.get(`/payments/${paymentId}/`),
        api.get('/chitgroups/'),
        isAdmin ? api.get('/auth/users/') : Promise.resolve({ data: { results: [] } })
      ]);
      
      const pData = pRes.data;
      setPayment(pData);
      setForm({
        user: String(pData.user),
        chitgroup: String(pData.chitgroup),
        amount_paid: String(pData.amount_paid),
        payment_month: pData.payment_month.substring(0, 7),
      });

      const gData = gRes.data.results || gRes.data;
      setGroups(Array.isArray(gData) ? gData : []);

      if (isAdmin) {
        const uData = uRes.data.results || uRes.data;
        setUsers(Array.isArray(uData) ? uData : []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [paymentId, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        user: parseInt(form.user),
        chitgroup: parseInt(form.chitgroup),
        payment_month: form.payment_month + '-01',
      };
      
      await api.put(`/payments/${paymentId}/`, payload);
      
      if (screenshotFile) {
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        await api.post(`/payments/${paymentId}/upload-screenshot/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/payments');
    } catch (err) {
      console.error('Failed to update payment:', err);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this payment?')) {
      setSubmitting(true);
      try {
        await api.delete(`/payments/${paymentId}/`);
        router.push('/payments');
      } catch (err) {
        console.error('Failed to delete payment:', err);
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <CardSkeleton />
      </div>
    );
  }

  if (!payment) return <div style={{ color: '#f87171' }}>Payment not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => router.push('/payments')}
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
        >
          &larr; Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Payment Details</h1>
      </div>

      <div className="glass-card-static" style={{ padding: 24, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <div className="responsive-grid">
            
            {/* Left Column: Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">User</label>
                <select
                  className="form-select"
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  required
                  disabled={!isAdmin}
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
                  ))}
                  {!isAdmin && <option value={payment.user}>{payment.user_detail?.full_name}</option>}
                </select>
              </div>

              <div>
                <label className="form-label">Chit Group</label>
                <select
                  className="form-select"
                  value={form.chitgroup}
                  onChange={(e) => setForm({ ...form, chitgroup: e.target.value })}
                  required
                  disabled={!isAdmin}
                >
                  <option value="">Select Group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (₹{g.individual_chit_amount}/chit)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Amount Paid</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={form.amount_paid}
                  onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                  required
                  disabled={!isAdmin}
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
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {/* Right Column: Screenshot */}
            <div>
              <label className="form-label">Screenshot Image</label>
              <div style={{ 
                background: 'var(--color-surface-700)', 
                border: '1px solid var(--color-glass-border)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                {(screenshotPreview || payment.screenshot_full_url) ? (
                  <img
                    src={screenshotPreview || getMediaUrl(payment.screenshot_full_url!)}
                    alt="Payment Screenshot"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    No screenshot uploaded
                  </div>
                )}
                
                {isAdmin && (
                  <div>
                    <label className="form-label" style={{ fontSize: 12 }}>Upload New Image</label>
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
                  </div>
                )}
              </div>
            </div>

          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-glass-border)' }}>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={submitting}
              >
                Delete Payment
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
          )}
        </form>
      </div>
    </div>
  );
}
