'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api, { getMediaUrl } from '@/lib/api';
import { MonthlyChitWinner, ChitGroup, User } from '@/lib/types';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function WinnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const winnerId = params.id;
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [winner, setWinner] = useState<MonthlyChitWinner | null>(null);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [form, setForm] = useState({
    user: '',
    chitgroup: '',
    total_amount_won: '',
    month: '',
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [wRes, gRes, uRes] = await Promise.all([
        api.get(`/winners/${winnerId}/`),
        api.get('/chitgroups/'),
        isAdmin ? api.get('/auth/users/') : Promise.resolve({ data: { results: [] } })
      ]);
      
      const wData = wRes.data;
      setWinner(wData);
      setForm({
        user: String(wData.user),
        chitgroup: String(wData.chitgroup),
        total_amount_won: String(wData.total_amount_won),
        month: wData.month.substring(0, 7),
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
  }, [winnerId, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setSubmitting(true);
    try {
      const payload = {
        user: parseInt(form.user),
        chitgroup: parseInt(form.chitgroup),
        total_amount_won: form.total_amount_won,
        month: form.month,
      };
      
      await api.put(`/winners/${winnerId}/`, payload);
      
      if (screenshotFile) {
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        await api.post(`/winners/${winnerId}/upload-screenshot/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/winners');
    } catch (err) {
      console.error('Failed to update winner:', err);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this winner record?')) {
      setSubmitting(true);
      try {
        await api.delete(`/winners/${winnerId}/`);
        router.push('/winners');
      } catch (err) {
        console.error('Failed to delete winner:', err);
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

  if (!winner) return <div style={{ color: '#f87171' }}>Winner not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => router.push('/winners')}
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
        >
          &larr; Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Winner Details</h1>
      </div>

      <div className="glass-card-static" style={{ padding: 24, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <div className="responsive-grid">
            
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
                  {!isAdmin && <option value={winner.user}>{winner.user_detail?.full_name}</option>}
                </select>
              </div>

              <div>
                <label className="form-label">Amount Won</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={form.total_amount_won}
                  onChange={(e) => setForm({ ...form, total_amount_won: e.target.value })}
                  required
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <label className="form-label">Month</label>
                <input
                  className="form-input"
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Payment Confirmation</label>
              <div style={{ 
                background: 'var(--color-surface-700)', 
                border: '1px solid var(--color-glass-border)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                {(screenshotPreview || winner.payment_confirmation_full_url) ? (
                  <img
                    src={screenshotPreview || getMediaUrl(winner.payment_confirmation_full_url!)}
                    alt="Payment Confirmation"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    No payment confirmation uploaded
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
                Delete Winner
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
