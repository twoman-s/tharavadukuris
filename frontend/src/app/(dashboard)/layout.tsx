'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div style={{
        marginLeft: 0,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
      }}>
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main style={{
          padding: '24px 20px',
          maxWidth: 1280,
          margin: '0 auto',
        }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Desktop sidebar offset */}
      <style>{`
        @media (min-width: 769px) {
          div[style*="margin-left: 0"] {
            margin-left: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}
