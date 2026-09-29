export function rootVars(theme) {
  const dark = {
    '--bg': '#0B0F19',
    '--surface': '#111827',
    '--surface-2': '#1F2937',
    '--surface-hover': '#374151',
    '--border': '#2D3748',
    '--border-light': '#1F2937',
    '--text': '#F9FAFB',
    '--text-muted': '#9CA3AF',
    '--text-dim': '#6B7280',
    '--accent1': '#2563EB',
    '--accent2': '#4F46E5',
    '--accent-glow': 'rgba(99, 102, 241, 0.25)',
    '--success': '#10B981',
    '--warning': '#F59E0B',
    '--danger': '#EF4444',
    '--info': '#06B6D4',
    '--font-heading': "'Syne', -apple-system, sans-serif",
    '--font-body': "'DM Sans', -apple-system, sans-serif",
    '--font-mono': "'Space Mono', monospace",
  };
  const light = {
    '--bg': '#F8FAFC',
    '--surface': '#FFFFFF',
    '--surface-2': '#F1F5F9',
    '--surface-hover': '#E2E8F0',
    '--border': '#E2E8F0',
    '--border-light': '#F1F5F9',
    '--text': '#0F172A',
    '--text-muted': '#64748B',
    '--text-dim': '#94A3B8',
    '--accent1': '#2563EB',
    '--accent2': '#4F46E5',
    '--accent-glow': 'rgba(37, 99, 235, 0.15)',
    '--success': '#059669',
    '--warning': '#D97706',
    '--danger': '#DC2626',
    '--info': '#0891B2',
    '--font-heading': "'Syne', -apple-system, sans-serif",
    '--font-body': "'DM Sans', -apple-system, sans-serif",
    '--font-mono': "'Space Mono', monospace",
  };
  const vars = theme === 'dark' ? dark : light;
  const style = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' };
  Object.entries(vars).forEach(([k, v]) => { style[k] = v; });
  return style;
}

export const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

html, body {
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  overflow-x: hidden;
}

* { box-sizing: border-box; }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }

input, select, textarea, button { font-family: var(--font-body); }

input, select, textarea {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--accent2);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

label {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

table { width: 100%; border-collapse: collapse; font-size: 13px; }
th {
  text-align: left;
  padding: 11px 14px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  background: var(--surface-2);
}
td { padding: 11px 14px; border-bottom: 1px solid var(--border); white-space: nowrap; }
tr:hover td { background: var(--surface-hover); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 10px;
  padding: 9px 15px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  user-select: none;
  min-height: 38px;
}
.btn:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 12px var(--accent-glow);
}
.btn-primary:hover {
  filter: brightness(1.12);
  box-shadow: 0 6px 16px var(--accent-glow);
}
.btn-danger {
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--danger);
  background: rgba(239, 68, 68, 0.08);
}
.btn-danger:hover {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; min-height: 32px; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.scrollx {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid var(--border);
  max-width: 100%;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.admin-charts-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
.mobile-menu-btn { display: none !important; }

/* Responsive Filter & Action Layout */
.filter-bar-responsive {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.filter-inputs-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}

/* Animations for Start Loader */
@keyframes loadingProgress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(-20%); }
  100% { transform: translateX(100%); }
}

@keyframes pulseGlow {
  0% { transform: scale(0.96); opacity: 0.3; }
  100% { transform: scale(1.08); opacity: 0.65; }
}

@keyframes floatLogo {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-5px); }
}

/* Comprehensive Responsive Breakpoints */
@media (max-width: 860px) {
  .hide-mobile { display: none !important; }
  .hide-mobile-sidebar { transform: translateX(-100%) !important; }
  .mobile-menu-btn { display: inline-flex !important; }
  .grid-2, .grid-3, .admin-charts-grid { grid-template-columns: 1fr !important; }
  .main-content-padding { padding: 14px !important; }
  .card { padding: 16px; }
}

@media (max-width: 640px) {
  .filter-bar-responsive {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-inputs-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .filter-inputs-group input, .filter-inputs-group select {
    width: 100% !important;
  }
  .stat-card-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
  th, td {
    padding: 9px 10px;
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .stat-card-grid {
    grid-template-columns: 1fr !important;
  }
  .main-content-padding { padding: 10px !important; }
  .card { padding: 14px; border-radius: 12px; }
  .btn { width: 100%; justify-content: center; }
  .btn-sm { width: auto; }
}
`;


