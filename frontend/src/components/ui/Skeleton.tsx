'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card-static" style={{ padding: 24 }}>
      <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={28} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', display: 'flex', gap: 24 }}>
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} height={12} width={`${100 / cols - 4}%`} />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{
          padding: '14px 20px',
          display: 'flex',
          gap: 24,
          borderTop: '1px solid var(--color-glass-border)',
        }}>
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} height={14} width={`${100 / cols - 4}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
