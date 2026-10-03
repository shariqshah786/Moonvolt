"use client";
import React from 'react';
import { STATUS_COLORS } from '../../lib/constants';
import { X } from 'lucide-react';



export function StatCard({ label, value, icon: Icon, accent = 'var(--accent1)' }) {
  return (
    <div className="card stat-card" style={{
      display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, var(--surface), var(--surface-2))',
      border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Accent glowing indicator line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${accent}18`,
          border: `1px solid ${accent}33`,
          boxShadow: `0 2px 8px ${accent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={17} color={accent} />
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'var(--text-muted)';
  return <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>{status}</span>;
}

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto'
    }} onClick={onClose}>
      <div className="card modal-card" style={{
        width: '100%', maxWidth: width, maxHeight: '92vh', overflowY: 'auto',
        background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)', margin: 'auto', padding: 22,
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        {/* Mobile Pull Grabber Bar */}
        <div className="modal-grabber" style={{
          width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '-6px auto 14px',
          display: 'none'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--text)' }}>{title}</span>
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

