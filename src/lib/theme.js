export function rootVars(theme) {
  const dark = {
    '--bg': '#070B16', '--surface': '#0F1626', '--surface-2': '#161F35', '--surface-hover': '#1E2A47',
    '--border': '#26314F', '--text': '#F0F3FA', '--text-muted': '#8993B0', '--text-dim': '#5A6480',
    '--accent1': '#1E3A8A', '--accent2': '#3B82F6', '--success': '#33D69F', '--warning': '#FFB020', '--danger': '#FF5C5C', '--info': '#4FA8FF',
    '--font-heading': "'Syne', sans-serif", '--font-body': "'DM Sans', sans-serif", '--font-mono': "'Space Mono', monospace",
  };
  const light = {
    '--bg': '#F2F4FA', '--surface': '#FFFFFF', '--surface-2': '#EBEFF8', '--surface-hover': '#DFE5F3',
    '--border': '#D6DDEE', '--text': '#0F1B33', '--text-muted': '#5B6684', '--text-dim': '#96A0BB',
    '--accent1': '#1E3A8A', '--accent2': '#2563EB', '--success': '#0F9D6B', '--warning': '#C77800', '--danger': '#D93A3A', '--info': '#2270C7',
    '--font-heading': "'Syne', sans-serif", '--font-body': "'DM Sans', sans-serif", '--font-mono': "'Space Mono', monospace",
  };
  const vars = theme === 'dark' ? dark : light;
  const style = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' };
  Object.entries(vars).forEach(([k, v]) => { style[k] = v; });
  return style;
}

export const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
html, body {
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 0;
}
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
input, select, textarea, button { font-family: var(--font-body); }
input, select, textarea {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: 8px; padding: 9px 11px; font-size: 13px; width: 100%; outline: none;
}
input:focus, select:focus, textarea:focus { border-color: var(--accent1); }
label { font-size: 12px; color: var(--text-muted); display:block; margin-bottom: 4px; font-weight: 500; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 10px 12px; border-bottom: 1px solid var(--border); white-space: nowrap; }
tr:hover td { background: var(--surface-hover); }
.btn { display:inline-flex; align-items:center; gap:6px; border-radius: 8px; padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); transition: all .15s; white-space: nowrap; }
.btn:hover { background: var(--surface-hover); }
.btn-primary { background: linear-gradient(135deg, var(--accent1), var(--accent2)); border: none; color: #fff; }
.btn-primary:hover { filter: brightness(1.08); }
.btn-danger { border-color: var(--danger); color: var(--danger); background: transparent; }
.btn-danger:hover { background: var(--danger); color: #fff; }
.btn-sm { padding: 5px 9px; font-size: 12px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
.badge { display:inline-flex; align-items:center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.scrollx { overflow-x: auto; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.admin-charts-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
.mobile-menu-btn { display: none !important; }
@media (max-width: 860px) {
  .hide-mobile { display: none !important; }
  .hide-mobile-sidebar { display: none !important; }
  .mobile-menu-btn { display: inline-flex !important; }
  .grid-2, .grid-3, .admin-charts-grid { grid-template-columns: 1fr !important; }
}
`;

