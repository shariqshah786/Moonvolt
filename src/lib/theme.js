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

/* Desktop Sidebar */
.sidebar {
  width: 248px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  left: 0;
  top: 0;
  z-index: 100;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

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

/* Animations */
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

@keyframes sheetSlideUp {
  from { transform: translateY(100%); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}

/* Mobile Bottom Navigation Bar */
.mobile-bottom-nav {
  display: none;
}

/* Touch & Micro-interaction Enhancements */
.card {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn {
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn:active {
  transform: scale(0.97);
}

/* Responsive Breakpoints */
@media (max-width: 992px) {
  .admin-charts-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 860px) {
  .sidebar {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 280px !important;
    max-width: 85vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    z-index: 250 !important;
    box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5) !important;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.28s ease !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .hide-mobile-sidebar {
    transform: translateX(-100%) !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .mobile-menu-btn {
    display: inline-flex !important;
  }
  .hide-mobile {
    display: none !important;
  }
  .grid-2, .grid-3 {
    grid-template-columns: 1fr !important;
  }
  .main-content-padding {
    padding: 16px 14px 84px !important;
  }
  .card {
    padding: 16px !important;
    border-radius: 16px !important;
  }
  .stat-card-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
    gap: 12px !important;
  }

  /* Sleek Floating Bottom Navigation */
  .mobile-bottom-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    z-index: 95;
    padding: 0 8px calc(env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
  }
  .mobile-bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 600;
    transition: all 0.2s ease;
    padding: 6px 0;
    -webkit-tap-highlight-color: transparent;
  }
  .mobile-bottom-nav-item.active {
    color: var(--text);
  }
  .mobile-bottom-nav-item.active .mobile-nav-icon-wrap {
    background: linear-gradient(135deg, var(--accent1), var(--accent2));
    color: #ffffff;
    box-shadow: 0 2px 10px var(--accent-glow);
    transform: translateY(-2px);
  }
  .mobile-nav-icon-wrap {
    width: 36px;
    height: 28px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-muted);
  }
}

@media (max-width: 640px) {
  .topbar-subtext {
    display: none !important;
  }
  .filter-bar-responsive {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  .filter-inputs-group {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
    gap: 8px !important;
  }
  .filter-inputs-group input,
  .filter-inputs-group select {
    width: 100% !important;
  }
  .stat-card-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
  th, td {
    padding: 9px 12px !important;
    font-size: 12px !important;
  }
  .main-content-padding {
    padding: 12px 12px 88px !important;
  }
  .card {
    padding: 14px !important;
    border-radius: 14px !important;
  }

  /* Modal Bottom Sheet */
  .modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }
  .modal-card {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-top-left-radius: 24px !important;
    border-top-right-radius: 24px !important;
    max-height: 88vh !important;
    padding: 16px 16px 36px !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    animation: sheetSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .modal-grabber {
    display: block !important;
  }
  .notif-dropdown {
    position: fixed !important;
    top: 60px !important;
    left: 12px !important;
    right: 12px !important;
    width: auto !important;
    max-width: none !important;
    z-index: 260 !important;
  }
}

@media (max-width: 440px) {
  .stat-card-grid {
    grid-template-columns: 1fr !important;
  }
  .main-content-padding {
    padding: 10px 10px 88px !important;
  }
  .card {
    padding: 12px !important;
    border-radius: 12px !important;
  }
  th, td {
    padding: 8px 10px !important;
    font-size: 11px !important;
  }
}
`;


