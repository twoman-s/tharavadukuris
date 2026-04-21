'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { AdminDashboard, UserDashboard } from '@/lib/types';
import StatCard from '@/components/ui/StatCard';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [userData, setUserData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard/');
        if (isAdmin) {
          setAdminData(res.data);
        } else {
          setUserData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAdmin]);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>
          Dashboard
        </h1>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
          {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Welcome back, {user?.first_name || user?.username} 👋
        </p>
      </div>

      {isAdmin && adminData && (
        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <StatCard
            title="Total Groups"
            value={adminData.total_groups}
            icon="🏛️"
            variant="gold"
            subtitle="Active chit groups"
          />
          <StatCard
            title="Total Users"
            value={adminData.total_users}
            icon="👥"
            variant="blue"
            subtitle="Active members"
          />
          <StatCard
            title="Monthly Collection"
            value={formatCurrency(adminData.monthly_collection)}
            icon="💰"
            variant="green"
            subtitle={`For ${adminData.current_month}`}
          />
          <StatCard
            title="Total Collected"
            value={formatCurrency(adminData.total_collected)}
            icon="📦"
            variant="purple"
            subtitle={`${adminData.recent_payments_count} payments this month`}
          />
          <StatCard
            title="Winners Allocated"
            value={adminData.total_winners}
            icon="🏆"
            variant="gold"
            subtitle="Total winners declared"
          />
        </div>
      )}

      {!isAdmin && userData && (
        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <StatCard
            title="My Groups"
            value={userData.my_groups}
            icon="🏛️"
            variant="gold"
            subtitle="Chit groups enrolled"
          />
          <StatCard
            title="My Allocations"
            value={userData.my_allocations}
            icon="📋"
            variant="blue"
            subtitle="Active allocations"
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(userData.total_paid)}
            icon="💳"
            variant="green"
            subtitle="Lifetime payments"
          />
          <StatCard
            title="Monthly Contribution"
            value={formatCurrency(userData.monthly_contribution)}
            icon="📅"
            variant="purple"
            subtitle="Per month"
          />
          <StatCard
            title="Wins"
            value={userData.total_wins}
            icon="🏆"
            variant="gold"
            subtitle="Chits won"
          />
        </div>
      )}

      {/* Quick info */}
      <div className="glass-card-static" style={{ padding: 24, marginTop: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
          Quick Info
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface-700)',
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Role</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface-700)',
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Email</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              {user?.email || '—'}
            </p>
          </div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface-700)',
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Member Since</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
