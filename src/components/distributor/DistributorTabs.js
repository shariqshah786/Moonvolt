"use client";
import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Package, Users, Truck, ShieldCheck, FileText, Search,
  Bell, Sun, Moon, LogOut, Plus, Edit2, Trash2, X, Check, AlertTriangle,
  ChevronDown, Download, Menu, Car, TrendingUp, ClipboardList, UserCircle2,
  ScrollText, Filter, Eye, EyeOff, RefreshCw, IndianRupee, MapPin, Megaphone,
  Landmark, Sparkles, Wallet, BadgeCheck, HandCoins, CalendarClock, Percent,
  MessageSquare, History, ExternalLink, FileCheck2, BatteryFull, Paperclip, Wrench
} from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS, STORAGE_KEY, PAYMENT_MODES, ANNOUNCEMENT_TYPES, SMS_TYPES, ADMIN_CREDENTIALS } from '../../lib/constants';
import { uid, pad4, genVehicleId, genInvoice, fmtDate, todayStr, addMonths, daysUntil, inr, csvDownload, excelDownload, printReport } from '../../lib/helpers';
import { StatCard, StatusBadge, grid2, grid3 } from '../ui/SharedUI';



export function DistributorDashboard({ db, session }) {
  const myVehicles = db.vehicles.filter(v => v.distributorId === session.distributorId);
  const stock = myVehicles.filter(v => v.status === 'Sent to Distributor').length;
  const sold = myVehicles.filter(v => v.status === 'Sold' || v.status === 'Warranty Expired').length;
  const mySales = db.sales.filter(s => s.distributorId === session.distributorId);
  const today = todayStr();
  const salesToday = mySales.filter(s => s.saleDate === today).length;
  const thisMonth = today.slice(0, 7);
  const monthlySalesCount = mySales.filter(s => s.saleDate.slice(0, 7) === thisMonth).length;
  const claims = (db.claims || []).filter(c => c.distributorId === session.distributorId);
  const pendingRegs = mySales.filter(s => !s.customer.pan && !s.customer.dl).length;

  const trend = useMemo(() => {
    const map = {};
    mySales.forEach(s => { const k = s.saleDate.slice(0, 7); map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort().map(([month, count]) => ({ month, sales: count }));
  }, [mySales]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Current Stock" value={stock} icon={Package} accent="#4FA8FF" />
        <StatCard label="Vehicles Sold" value={sold} icon={TrendingUp} accent="#FFB020" />
        <StatCard label="Sales Today" value={salesToday} icon={Car} accent="#33D69F" />
        <StatCard label="Monthly Sales" value={monthlySalesCount} icon={ClipboardList} accent="#3B82F6" />
        <StatCard label="Warranty Claims" value={claims.length} icon={ShieldCheck} accent="#FF5C5C" />
        <StatCard label="Pending Registrations" value={pendingRegs} icon={AlertTriangle} accent="#FFB020" />
      </div>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>My Sales Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }} />
            <Line type="monotone" dataKey="sales" stroke="var(--accent2)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




export function MyInventoryTab({ db, session }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const myVehicles = db.vehicles.filter(v => v.distributorId === session.distributorId && (filterStatus === 'All' || v.status === filterStatus));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 220 }}>
        <option>All</option><option>Sent to Distributor</option><option>Sold</option><option>Warranty Expired</option>
      </select>
      <div className="card scrollx">
        <table>
          <thead><tr><th>Vehicle ID</th><th>Category</th><th>Model</th><th>Chassis No.</th><th>Battery</th><th>Charger</th><th>Status</th></tr></thead>
          <tbody>
            {myVehicles.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td><td>{v.category}</td><td>{v.model}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.batterySerial}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chargerSerial}</td>
                <td><StatusBadge status={v.status} /></td>
              </tr>
            ))}
            {myVehicles.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function SellTab({ db, persist, addAudit, showToast, session }) {
  const availableVehicles = db.vehicles.filter(v => v.distributorId === session.distributorId && v.status === 'Sent to Distributor');
  const [vehicleId, setVehicleId] = useState('');
  const [customer, setCustomer] = useState({ fullName: '', fatherName: '', mobile: '', altMobile: '', address: '', city: '', state: '', pin: '', aadhaar: '', pan: '', dl: '' });
  const [kyc, setKyc] = useState({ aadhaar: null, pan: null, photo: null, addressProof: null, other: null });
  const [sellingPrice, setSellingPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [invoice, setInvoice] = useState(genInvoice('SAL'));
  const [saleDate, setSaleDate] = useState(todayStr());

  const setC = (k, v) => setCustomer(c => ({ ...c, [k]: v }));
  const setKycFile = (k, e) => setKyc(x => ({ ...x, [k]: e.target.files?.[0]?.name || null }));

  const selectedVehicle = db.vehicles.find(v => v.id === vehicleId);
  const [error, setError] = useState('');

  const submit = () => {
    if (!selectedVehicle) { setError('Please select a vehicle.'); return; }
    if (!customer.fullName || !customer.mobile || !customer.address || !customer.city || !customer.state || !customer.pin || !customer.aadhaar) {
      setError('Please fill in all required customer fields.');
      return;
    }
    if (!sellingPrice) { setError('Please enter a selling price.'); return; }
    setError('');
    const battStart = saleDate;
    const battEnd = addMonths(saleDate, BATTERY_WARRANTY_MONTHS);
    const chgEnd = addMonths(saleDate, CHARGER_WARRANTY_MONTHS);
    const newDb = {
      ...db,
      vehicles: db.vehicles.map(v => v.id === vehicleId ? { ...v, status: 'Sold', batteryWarranty: { start: battStart, end: battEnd }, chargerWarranty: { start: battStart, end: chgEnd } } : v),
      sales: [...db.sales, { id: uid('SALE'), vehicleId, distributorId: session.distributorId, customer, kyc: { aadhaar: !!kyc.aadhaar, pan: !!kyc.pan, photo: !!kyc.photo, addressProof: !!kyc.addressProof, other: !!kyc.other }, sellingPrice: Number(sellingPrice), discount: Number(discount), invoiceNumber: invoice, saleDate }],
    };
    addAudit(newDb, session.name, `Sold vehicle ${vehicleId} to ${customer.fullName} (Invoice ${invoice})`);
    persist(newDb);
    showToast(`Vehicle ${vehicleId} sold to ${customer.fullName}`);
    setVehicleId(''); setCustomer({ fullName: '', fatherName: '', mobile: '', altMobile: '', address: '', city: '', state: '', pin: '', aadhaar: '', pan: '', dl: '' });
    setKyc({ aadhaar: null, pan: null, photo: null, addressProof: null, other: null });
    setSellingPrice(''); setDiscount('0'); setInvoice(genInvoice('SAL')); setSaleDate(todayStr());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Vehicle Details</div>
        <label>Select Vehicle from Available Stock</label>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
          <option value="">Choose vehicle…</option>
          {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.category} {v.model}</option>)}
        </select>
        {selectedVehicle && (
          <div style={{ ...grid3, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <div>Chassis: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{selectedVehicle.chassisNumber}</span></div>
            <div>Motor: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{selectedVehicle.motorNumber}</span></div>
            <div>Battery: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{selectedVehicle.batterySerial}</span></div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Customer Details</div>
        <div className="grid-2">
          <div><label>Full Name</label><input value={customer.fullName} onChange={e => setC('fullName', e.target.value)} /></div>
          <div><label>Father's Name</label><input value={customer.fatherName} onChange={e => setC('fatherName', e.target.value)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Mobile Number</label><input value={customer.mobile} onChange={e => setC('mobile', e.target.value)} /></div>
          <div><label>Alternate Mobile</label><input value={customer.altMobile} onChange={e => setC('altMobile', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><label>Address</label><input value={customer.address} onChange={e => setC('address', e.target.value)} /></div>
        <div className="grid-3" style={{ marginTop: 10 }}>
          <div><label>City</label><input value={customer.city} onChange={e => setC('city', e.target.value)} /></div>
          <div><label>State</label><input value={customer.state} onChange={e => setC('state', e.target.value)} /></div>
          <div><label>PIN Code</label><input value={customer.pin} onChange={e => setC('pin', e.target.value)} /></div>
        </div>
        <div className="grid-3" style={{ marginTop: 10 }}>
          <div><label>Aadhaar Number</label><input value={customer.aadhaar} onChange={e => setC('aadhaar', e.target.value)} /></div>
          <div><label>PAN Number (optional)</label><input value={customer.pan} onChange={e => setC('pan', e.target.value)} /></div>
          <div><label>Driving License (optional)</label><input value={customer.dl} onChange={e => setC('dl', e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>KYC Documents</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>File contents are not stored in this demo — only the filename is recorded.</div>
        <div className="grid-3">
          <div><label>Aadhaar</label><input type="file" onChange={e => setKycFile('aadhaar', e)} /></div>
          <div><label>PAN</label><input type="file" onChange={e => setKycFile('pan', e)} /></div>
          <div><label>Photograph</label><input type="file" onChange={e => setKycFile('photo', e)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Address Proof</label><input type="file" onChange={e => setKycFile('addressProof', e)} /></div>
          <div><label>Other KYC Document</label><input type="file" onChange={e => setKycFile('other', e)} /></div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Sale Details</div>
        <div className="grid-2">
          <div><label>Selling Price (₹)</label><input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} /></div>
          <div><label>Discount (₹)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Invoice Number</label><input value={invoice} onChange={e => setInvoice(e.target.value)} /></div>
          <div><label>Date of Sale</label><input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="btn btn-primary" onClick={submit}><Car size={14} /> Complete Sale</div>
      </div>
    </div>
  );
}




export function SalesHistoryTab({ db, session }) {
  const [viewing, setViewing] = useState(null);
  const mySales = db.sales.filter(s => s.distributorId === session.distributorId).sort((a, b) => b.saleDate.localeCompare(a.saleDate));
  const exportRows = () => mySales.map(s => ({ Invoice: s.invoiceNumber, 'Vehicle ID': s.vehicleId, Customer: s.customer.fullName, Mobile: s.customer.mobile, 'Selling Price': s.sellingPrice, Discount: s.discount, 'Sale Date': fmtDate(s.saleDate) }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={() => csvDownload('my_sales.csv', exportRows())}><Download size={14} /> Export CSV</button>
        <button className="btn" onClick={() => excelDownload('my_sales.xlsx', exportRows(), 'Sales')}><Download size={14} /> Export Excel</button>
      </div>
      <div className="card scrollx">
        <table>
          <thead><tr><th>Invoice</th><th>Vehicle ID</th><th>Customer</th><th>Mobile</th><th>Price</th><th>Discount</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {mySales.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.invoiceNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.vehicleId}</td>
                <td>{s.customer.fullName}</td><td>{s.customer.mobile}</td>
                <td>{inr(s.sellingPrice)}</td><td>{inr(s.discount)}</td><td>{fmtDate(s.saleDate)}</td>
                <td><span onClick={() => setViewing(s)} style={{ color: 'var(--accent2)', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> View Details</span></td>
              </tr>
            ))}
            {mySales.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {viewing && <CustomerDetailModal db={db} sale={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}




export function ClaimsTab({ db, persist, addAudit, showToast, session }) {
  const [vehicleId, setVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const mySoldVehicles = db.vehicles.filter(v => v.distributorId === session.distributorId && (v.status === 'Sold' || v.status === 'Warranty Expired'));
  const myClaims = (db.claims || []).filter(c => c.distributorId === session.distributorId);

  const [error, setError] = useState('');
  const submit = () => {
    if (!vehicleId || !issue) { setError('Please select a vehicle and describe the issue.'); return; }
    setError('');
    const newDb = { ...db, claims: [...(db.claims || []), { id: uid('CLM'), vehicleId, distributorId: session.distributorId, issueDescription: issue, dateRaised: todayStr(), status: 'Pending' }] };
    addAudit(newDb, session.name, `Raised warranty claim on vehicle ${vehicleId}`);
    persist(newDb);
    showToast('Warranty claim submitted to admin');
    setVehicleId(''); setIssue('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Raise a Warranty Claim</div>
        <div>
          <div className="grid-2">
            <div><label>Vehicle</label>
              <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                <option value="">Choose vehicle…</option>
                {mySoldVehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.model}</option>)}
              </select>
            </div>
            <div><label>Issue Description</label><input value={issue} onChange={e => setIssue(e.target.value)} placeholder="e.g. Battery not holding charge" /></div>
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <div className="btn btn-primary" onClick={submit}><ShieldCheck size={14} /> Submit Claim</div>
          </div>
        </div>
      </div>
      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>My Claims</div>
        <table>
          <thead><tr><th>Vehicle ID</th><th>Issue</th><th>Date Raised</th><th>Status</th></tr></thead>
          <tbody>
            {myClaims.map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.vehicleId}</td><td>{c.issueDescription}</td><td>{fmtDate(c.dateRaised)}</td>
                <td><span className="badge" style={{ background: c.status === 'Pending' ? '#FFB02022' : '#33D69F22', color: c.status === 'Pending' ? 'var(--warning)' : 'var(--success)' }}>{c.status}</span></td>
              </tr>
            ))}
            {myClaims.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No claims raised yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function txnFinance(t, payments) {
  const interest = t.paymentType === 'Credit' ? Math.round((t.totalAmount || 0) * (t.interestRate || 0) / 100) : 0;
  const payable = (t.totalAmount || 0) + interest;
  const paid = payments.filter(p => p.transactionId === t.id).reduce((s, p) => s + p.amount, 0);
  const balance = payable - paid;
  const overdue = t.paymentType === 'Credit' && balance > 0 && t.dueDate && daysUntil(t.dueDate) < 0;
  return { interest, payable, paid, balance, overdue };
}




export function DistributorFinanceTab({ db, session }) {
  const myTxns = db.transactions.filter(t => t.distributorId === session.distributorId);
  const myPayments = (db.payments || []).filter(p => p.distributorId === session.distributorId);

  let billed = 0, interest = 0, payable = 0, paid = 0;
  myTxns.forEach(t => {
    const f = txnFinance(t, db.payments || []);
    billed += t.totalAmount || 0; interest += f.interest; payable += f.payable; paid += f.paid;
  });
  const pending = payable - paid;

  const exportStatement = () => {
    const rows = myTxns.map(t => {
      const f = txnFinance(t, db.payments || []);
      return { Invoice: t.invoiceNumber, Type: t.paymentType, Principal: t.totalAmount, 'Interest Rate': `${t.interestRate}%`, Payable: f.payable, Paid: f.paid, Balance: f.balance, 'Due Date': fmtDate(t.dueDate) };
    });
    csvDownload('my_finance_statement.csv', rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Total Billed" value={inr(billed)} icon={IndianRupee} accent="#3B82F6" />
        <StatCard label="Interest Charged" value={inr(interest)} icon={Percent} accent="#FFB020" />
        <StatCard label="Total Paid" value={inr(paid)} icon={Wallet} accent="#33D69F" />
        <StatCard label="Pending Balance" value={inr(pending)} icon={CalendarClock} accent={pending > 0 ? '#FF5C5C' : '#33D69F'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn" onClick={exportStatement}><Download size={14} /> Download Statement</button>
      </div>

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>My Invoices</div>
        <table>
          <thead><tr><th>Invoice</th><th>Type</th><th>Principal</th><th>Interest</th><th>Payable</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {myTxns.map(t => {
              const f = txnFinance(t, db.payments || []);
              return (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.invoiceNumber}</td>
                  <td>{t.paymentType}</td>
                  <td>{inr(t.totalAmount)}</td>
                  <td>{inr(f.interest)}</td>
                  <td>{inr(f.payable)}</td>
                  <td>{inr(f.paid)}</td>
                  <td style={{ fontWeight: 700, color: f.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>{inr(f.balance)}</td>
                  <td>{t.dueDate ? fmtDate(t.dueDate) : '—'}</td>
                  <td>{f.balance <= 0 ? <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>Closed</span> : f.overdue ? <span className="badge" style={{ background: '#FF5C5C22', color: 'var(--danger)' }}>Overdue</span> : <span className="badge" style={{ background: '#FFB02022', color: 'var(--warning)' }}>Active</span>}</td>
                </tr>
              );
            })}
            {myTxns.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>My Payment History</div>
        <table>
          <thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Note</th></tr></thead>
          <tbody>
            {[...myPayments].sort((a, b) => b.date.localeCompare(a.date)).map(p => (
              <tr key={p.id}><td>{fmtDate(p.date)}</td><td>{inr(p.amount)}</td><td>{p.mode}</td><td>{p.note}</td></tr>
            ))}
            {myPayments.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function DistributorWarrantyCheckTab({ db, session }) {
  const [q, setQ] = useState('');

  const rows = db.vehicles.filter(v => v.distributorId === session.distributorId && v.batteryWarranty).map(v => {
    const sale = db.sales.find(s => s.vehicleId === v.id);
    return { vehicle: v, sale };
  }).filter(({ vehicle, sale }) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return vehicle.id.toLowerCase().includes(s) || vehicle.batterySerial.toLowerCase().includes(s) || vehicle.chargerSerial.toLowerCase().includes(s) || (sale?.customer?.mobile || '').includes(s);
  });

  const computeStatus = (endDate) => daysUntil(endDate) < 0 ? 'Expired' : 'Active';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input placeholder="Search by Vehicle ID, Battery Number, Charger Number, or Customer Mobile" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 460 }} />
      <div className="card scrollx">
        <table>
          <thead><tr><th>Vehicle ID</th><th>Customer</th><th>Battery No.</th><th>Battery Warranty</th><th>Status</th><th>Charger No.</th><th>Charger Warranty</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(({ vehicle, sale }) => (
              <tr key={vehicle.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{vehicle.id}</td>
                <td>{sale?.customer?.fullName || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{vehicle.batterySerial}</td>
                <td>{fmtDate(vehicle.batteryWarranty.start)} → {fmtDate(vehicle.batteryWarranty.end)}</td>
                <td><span className="badge" style={{ background: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? '#33D69F22' : '#FF5C5C22', color: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{computeStatus(vehicle.batteryWarranty.end)}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{vehicle.chargerSerial}</td>
                <td>{fmtDate(vehicle.chargerWarranty.start)} → {fmtDate(vehicle.chargerWarranty.end)}</td>
                <td><span className="badge" style={{ background: computeStatus(vehicle.chargerWarranty.end) === 'Active' ? '#33D69F22' : '#FF5C5C22', color: computeStatus(vehicle.chargerWarranty.end) === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{computeStatus(vehicle.chargerWarranty.end)}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No matching vehicles.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function TransactionHistoryTab({ db, session }) {
  const myTxns = [...db.transactions].filter(t => t.distributorId === session.distributorId).sort((a, b) => b.date.localeCompare(a.date));
  const exportRows = () => myTxns.map(t => ({ Invoice: t.invoiceNumber, Date: fmtDate(t.date), 'Vehicle Count': t.vehicleIds.length, 'Payment Type': t.paymentType, 'Total Amount': t.totalAmount, 'Delivery Status': t.deliveryStatus, 'Due Date': t.dueDate ? fmtDate(t.dueDate) : '—' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={() => csvDownload('my_old_transactions.csv', exportRows())}><Download size={14} /> Export CSV</button>
      </div>
      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>All Vehicle Deliveries Received</div>
        <table>
          <thead><tr><th>Invoice</th><th>Date</th><th>Vehicles</th><th>Payment Type</th><th>Amount</th><th>Delivery Status</th><th>Due Date</th></tr></thead>
          <tbody>
            {myTxns.map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{t.invoiceNumber}</td>
                <td>{fmtDate(t.date)}</td>
                <td>{t.vehicleIds.length}</td>
                <td>{t.paymentType}</td>
                <td>{inr(t.totalAmount)}</td>
                <td><span className="badge" style={{ background: t.deliveryStatus === 'Delivered' ? '#33D69F22' : '#FFB02022', color: t.deliveryStatus === 'Delivered' ? 'var(--success)' : 'var(--warning)' }}>{t.deliveryStatus}</span></td>
                <td>{t.dueDate ? fmtDate(t.dueDate) : '—'}</td>
              </tr>
            ))}
            {myTxns.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transactions on record yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function CustomerDetailModal({ db, sale, onClose }) {
  const vehicle = db.vehicles.find(v => v.id === sale.vehicleId);
  const distName = db.distributors.find(d => d.id === sale.distributorId)?.shopName || sale.distributorId;
  const c = sale.customer;
  const kycItems = [
    { key: 'aadhaar', label: 'Aadhaar Card' },
    { key: 'pan', label: 'PAN Card' },
    { key: 'photo', label: 'Photograph' },
    { key: 'addressProof', label: 'Address Proof' },
    { key: 'other', label: 'Other KYC Document' },
  ];

  return (
    <Modal title="Customer & Sale Details" onClose={onClose} width={640}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{c.fullName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Sold by {distName} · Invoice {sale.invoiceNumber} · {fmtDate(sale.saleDate)}</div>

        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Customer Information</div>
        <div className="grid-3">
          <div><label>Father's Name</label><div style={{ fontSize: 13 }}>{c.fatherName || '—'}</div></div>
          <div><label>Mobile</label><div style={{ fontSize: 13 }}>{c.mobile}</div></div>
          <div><label>Alternate Mobile</label><div style={{ fontSize: 13 }}>{c.altMobile || '—'}</div></div>
        </div>
        <div style={{ marginTop: 10 }}><label>Address</label><div style={{ fontSize: 13 }}>{c.address}, {c.city}, {c.state} — {c.pin}</div></div>
        <div className="grid-3" style={{ marginTop: 10 }}>
          <div><label>Aadhaar Number</label><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.aadhaar || '—'}</div></div>
          <div><label>PAN Number</label><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.pan || '—'}</div></div>
          <div><label>Driving License</label><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{c.dl || '—'}</div></div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, margin: '18px 0 8px' }}>KYC Documents</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          {kycItems.map(k => (
            <div key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px' }}>
              <Paperclip size={13} color={sale.kyc?.[k.key] ? 'var(--success)' : 'var(--text-dim)'} />
              <span style={{ fontSize: 12 }}>{k.label}</span>
              <span style={{ marginLeft: 'auto' }}>
                {sale.kyc?.[k.key] ? <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>On File</span> : <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-dim)' }}>Missing</span>}
              </span>
            </div>
          ))}
        </div>

        {vehicle && (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, margin: '18px 0 8px' }}>Vehicle & Sale Summary</div>
            <div className="grid-3">
              <div><label>Vehicle ID</label><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{vehicle.id}</div></div>
              <div><label>Model</label><div style={{ fontSize: 13 }}>{vehicle.category} {vehicle.model}</div></div>
              <div><label>Chassis No.</label><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{vehicle.chassisNumber}</div></div>
            </div>
            <div className="grid-3" style={{ marginTop: 10 }}>
              <div><label>Selling Price</label><div style={{ fontSize: 13 }}>{inr(sale.sellingPrice)}</div></div>
              <div><label>Discount</label><div style={{ fontSize: 13 }}>{inr(sale.discount)}</div></div>
              <div><label>Net Amount</label><div style={{ fontSize: 13, fontWeight: 700 }}>{inr(sale.sellingPrice - sale.discount)}</div></div>
            </div>
            {vehicle.batteryWarranty && (
              <div className="grid-2" style={{ marginTop: 10 }}>
                <div><label>Battery Warranty</label><div style={{ fontSize: 13 }}>{fmtDate(vehicle.batteryWarranty.start)} → {fmtDate(vehicle.batteryWarranty.end)}</div></div>
                <div><label>Charger Warranty</label><div style={{ fontSize: 13 }}>{fmtDate(vehicle.chargerWarranty.start)} → {fmtDate(vehicle.chargerWarranty.end)}</div></div>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Close</div>
        </div>
      </div>
    </Modal>
  );
}



export function DistributorProfileTab({ db, session }) {
  const distId = session.distributorId;
  const dist = db.distributors.find(d => d.id === distId);

  return (
    <div className="card" style={{ maxWidth: 520, margin: '20px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCircle2 size={20} color="#fff" />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}>{dist?.shopName || 'Distributor Profile'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{dist?.id}</code></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <div>
            <label>Shop Name</label>
            <input value={dist?.shopName || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)', fontWeight: 600 }} />
          </div>
          <div>
            <label>GST Number</label>
            <input value={dist?.gst || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)', fontFamily: 'var(--font-mono)' }} />
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label>Owner Name</label>
            <input value={dist?.ownerName || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)' }} />
          </div>
          <div>
            <label>Mobile Number</label>
            <input value={dist?.mobile || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)' }} />
          </div>
        </div>

        <div>
          <label>Email Address</label>
          <input value={dist?.email || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)' }} />
        </div>

        <div>
          <label>Shop Address</label>
          <input value={dist?.address || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)' }} />
        </div>

        <div className="grid-2">
          <div>
            <label>Login Username</label>
            <input value={dist?.username || ''} disabled style={{ opacity: 0.85, background: 'var(--surface-2)', fontFamily: 'var(--font-mono)' }} />
          </div>
          <div>
            <label>Account Status</label>
            <div style={{ paddingTop: 6 }}>
              <span className="badge" style={{ background: dist?.status === 'active' ? '#33D69F22' : '#FF5C5C22', color: dist?.status === 'active' ? 'var(--success)' : 'var(--danger)', fontSize: 12, padding: '5px 12px' }}>
                {dist?.status ? dist.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
          To update your distributor account details or password, please contact the Super Admin.
        </div>
      </div>
    </div>
  );
}
