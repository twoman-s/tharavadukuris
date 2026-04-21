'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { PaymentReport, ChitGroup } from '@/lib/types';
import DataTable from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/reports/payments/?';
      if (filterGroup) url += `chitgroup=${filterGroup}&`;
      if (filterMonth) url += `month=${filterMonth}&`;
      if (filterYear) url += `year=${filterYear}&`;
      const res = await api.get(url);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterMonth, filterYear]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/chitgroups/');
        const data = res.data.results || res.data;
        setGroups(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const userColumns = [
    {
      key: 'user__username',
      label: 'User',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>
          {(row.user__first_name && row.user__last_name)
            ? `${row.user__first_name} ${row.user__last_name}`
            : String(row.user__username)}
        </span>
      ),
    },
    {
      key: 'payment_count',
      label: 'Payments',
      render: (row: Record<string, unknown>) => (
        <span className="badge badge-blue">{String(row.payment_count)}</span>
      ),
    },
    {
      key: 'total_paid',
      label: 'Total Paid',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
          {formatCurrency(String(row.total_paid))}
        </span>
      ),
    },
  ];

  const groupColumns = [
    {
      key: 'chitgroup__name',
      label: 'Group',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{String(row.chitgroup__name)}</span>
      ),
    },
    {
      key: 'payment_count',
      label: 'Payments',
      render: (row: Record<string, unknown>) => (
        <span className="badge badge-blue">{String(row.payment_count)}</span>
      ),
    },
    {
      key: 'total_collected',
      label: 'Total Collected',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
          {formatCurrency(String(row.total_collected))}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Reports</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
          Payment analytics and summaries
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card-static" style={{
        padding: '16px 20px',
        marginBottom: 20,
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
          onChange={(e) => setFilterGroup(e.target.value)}
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
          onChange={(e) => { setFilterMonth(e.target.value); setFilterYear(''); }}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 100 }}
          value={filterYear}
          onChange={(e) => { setFilterYear(e.target.value); setFilterMonth(''); }}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {(filterGroup || filterMonth || filterYear) && (
          <button
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => { setFilterGroup(''); setFilterMonth(''); setFilterYear(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary stats */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : report && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <StatCard
            title="Total Payments"
            value={report.total_payments}
            icon="📋"
            variant="blue"
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(report.total_amount)}
            icon="💰"
            variant="green"
          />
        </div>
      )}

      {/* By User */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
          By User
        </h2>
        {loading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : (
          <DataTable
            columns={userColumns}
            data={report?.by_user || []}
            emptyMessage="No payment data"
          />
        )}
      </div>

      {/* By Group */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
          By Group
        </h2>
        {loading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : (
          <DataTable
            columns={groupColumns}
            data={report?.by_group || []}
            emptyMessage="No payment data"
          />
        )}
      </div>
    </div>
  );
}
