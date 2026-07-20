"use client";
import React, { useState, useMemo } from 'react';
import { Package, TrendingUp, Car, ClipboardList, ShieldCheck, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS } from '../../lib/constants';
import { todayStr, genInvoice, addMonths, uid, inr, fmtDate, csvDownload, excelDownload } from '../../lib/helpers';
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
          <thead><tr><th>Vehicle ID</th><th>Category</th><th>Model</th><th className="hide-mobile">Chassis No.</th><th className="hide-mobile">Battery</th><th className="hide-mobile">Charger</th><th>Status</th></tr></thead>
          <tbody>
            {myVehicles.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td><td>{v.category}</td><td>{v.model}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.batterySerial}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chargerSerial}</td>
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
          <div className="grid-3" style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
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
          <div><label>Father&apos;s Name</label><input value={customer.fatherName} onChange={e => setC('fatherName', e.target.value)} /></div>
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
          <thead><tr><th>Invoice</th><th>Vehicle ID</th><th>Customer</th><th className="hide-mobile">Mobile</th><th>Price</th><th className="hide-mobile">Discount</th><th>Date</th></tr></thead>
          <tbody>
            {mySales.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.invoiceNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.vehicleId}</td>
                <td>{s.customer.fullName}</td><td className="hide-mobile">{s.customer.mobile}</td>
                <td>{inr(s.sellingPrice)}</td><td className="hide-mobile">{inr(s.discount)}</td><td>{fmtDate(s.saleDate)}</td>
              </tr>
            ))}
            {mySales.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
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
