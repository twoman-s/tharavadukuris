'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'user'] },
  { href: '/chit-groups', label: 'Chit Groups', icon: '🏛️', roles: ['admin', 'user'] },
  { href: '/payments', label: 'Payments', icon: '💳', roles: ['admin', 'user'] },
  { href: '/winners', label: 'Winners', icon: '🏆', roles: ['admin', 'user'] },
  { href: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'user'] },
  { href: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const role = isAdmin ? 'admin' : 'user';

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          className="hide-desktop"
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: 'var(--color-surface-800)',
          borderRight: '1px solid var(--color-glass-border)',
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={isOpen ? '' : 'hide-mobile'}
        // On desktop, always show (override transform)
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--color-glass-border)',
        }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/tharavdukuris.png" 
              alt="Tharavadu Kuris" 
              style={{ height: 90, width: 'auto', objectFit: 'contain' }} 
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#f1f5f9' : '#94a3b8',
                    background: active
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))'
                      : 'transparent',
                    borderLeft: active ? '3px solid var(--color-brand-400)' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-glass-border)',
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--color-surface-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#e2e8f0',
              flexShrink: 0,
            }}>
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#e2e8f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.first_name || user?.username}
              </p>
              <p style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop: ensure sidebar is visible via CSS */}
      <style>{`
        @media (min-width: 769px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
