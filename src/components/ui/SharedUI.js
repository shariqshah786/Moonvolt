"use client";
import React from 'react';
import { STATUS_COLORS } from '../../lib/constants';
import { X } from 'lucide-react';



export function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: accent ? `${accent}22` : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={accent || 'var(--text-muted)'} />
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'var(--text-muted)';
  return <span className="badge" style={{ background: `${color}22`, color }}>{status}</span>;
}

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 80, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: width, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>{title}</span>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></span>
        </div>
        {children}
      </div>
    </div>
  );
}

export const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
export const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 };
