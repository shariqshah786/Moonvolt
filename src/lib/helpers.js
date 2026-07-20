import * as XLSX from 'xlsx';



export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

export const pad4 = (n) => String(n).padStart(4, '0');

export const genVehicleId = (seq) => `VH${new Date().getFullYear()}${pad4(seq)}`;

export const genInvoice = (prefix = 'INV') => `${prefix}-${Date.now().toString().slice(-8)}`;

export const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

export const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

export const inr = (n) => `\u20B9${Number(n || 0).toLocaleString('en-IN')}`;

export const csvDownload = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const excelDownload = (filename, rows, sheetName = 'Sheet1') => {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

export const printReport = (title, rows) => {
  if (!rows.length) { return; }
  const headers = Object.keys(rows[0]);
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  const style = `
    body{font-family:Arial,sans-serif;padding:24px;color:#111}
    h1{font-size:18px;margin-bottom:4px}
    p{color:#555;font-size:12px;margin-top:0}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ccc;padding:6px 8px;font-size:11px;text-align:left}
    th{background:#f2f2f2}
  `;
  const html = `<html><head><title>${title}</title><style>${style}</style></head><body>
    <h1>${title}</h1><p>Generated on ${fmtDate(todayStr())} · MoonVolt Vehicle Distribution System</p>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></body></html>`;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};
