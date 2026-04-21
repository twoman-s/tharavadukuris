'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chit-groups': 'Chit Groups',
  '/payments': 'Payments',
  '/winners': 'Winners',
  '/reports': 'Reports',
  '/users': 'Users',
};

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Find matching page title
  const pageTitle = Object.entries(PAGE_TITLES).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )?.[1] || 'Dashboard';

  return (
    <header
      style={{
        height: 64,
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="hide-desktop"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ☰
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#475569' }}>Home</span>
          <span style={{ fontSize: 13, color: '#475569' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{pageTitle}</span>
        </div>
      </div>

      <button
        onClick={logout}
        style={{
          background: 'none',
          border: '1px solid var(--color-glass-border)',
          color: '#94a3b8',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#f87171';
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.borderColor = 'var(--color-glass-border)';
        }}
      >
        Logout
      </button>
    </header>
  );
}
