"use client";
import React from 'react';
import { STATUS_COLORS } from '../../lib/constants';
import { X } from 'lucide-react';



export function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: accent ? `${accent}18` : 'var(--surface-2)',
          border: accent ? `1px solid ${accent}33` : '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={16} color={accent || 'var(--text-muted)'} />
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'var(--text-muted)';
  return <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>{status}</span>;
}

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflowY: 'auto'
    }} onClick={onClose}>
      <div className="card modal-card" style={{
        width: '100%', maxWidth: width, maxHeight: '92vh', overflowY: 'auto',
        background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', margin: 'auto', padding: 20
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>{title}</span>
          <button onClick={onClose} className="btn btn-sm" style={{ padding: 6, borderRadius: '50%', minWidth: 32, minHeight: 32, justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
export const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 };

