'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  variant?: 'gold' | 'blue' | 'green' | 'purple';
}

export default function StatCard({ title, value, subtitle, icon, variant = 'gold' }: StatCardProps) {
  return (
    <div
      className={`stat-card-${variant}`}
      style={{
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        fontSize: 28,
        lineHeight: 1,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#f1f5f9',
          lineHeight: 1.2,
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: 13,
            color: '#64748b',
            marginTop: 4,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
