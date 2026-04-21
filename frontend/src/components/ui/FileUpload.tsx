'use client';

import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  accept?: string;
  label?: string;
}

export default function FileUpload({
  onFileSelect,
  loading = false,
  accept = 'image/*',
  label = 'Upload Screenshot',
}: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--color-brand-400)' : 'var(--color-glass-border)'}`,
          borderRadius: 12,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          background: dragActive ? 'rgba(251, 191, 36, 0.05)' : 'transparent',
        }}
      >
        {loading ? (
          <div style={{ color: '#94a3b8' }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14 }}>Uploading...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>
              {fileName || label}
            </p>
            <p style={{ fontSize: 12, color: '#475569' }}>
              Drag & drop or click to browse
            </p>
          </>
        )}
      </div>
    </div>
  );
}
