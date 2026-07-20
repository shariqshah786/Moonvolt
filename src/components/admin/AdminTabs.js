"use client";
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Package, TrendingUp, Truck, AlertTriangle, ShieldCheck, Plus, Edit2, Trash2, Download, FileText, Search, Car } from 'lucide-react';
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD } from '../../lib/constants';
import { genVehicleId, todayStr, fmtDate, uid, inr, csvDownload, excelDownload, printReport, daysUntil, addMonths, genInvoice } from '../../lib/helpers';
import { StatCard, StatusBadge, Modal, grid2, grid3 } from '../ui/SharedUI';



export function AdminDashboard({ db }) {
  const totalStock = db.vehicles.filter(v => v.status === 'In Stock').length;
  const totalSold = db.vehicles.filter(v => v.status === 'Sold' || v.status === 'Warranty Expired').length;
  const totalSupplied = db.vehicles.filter(v => v.status === 'Sent to Distributor').length;
  const lowStockModels = ALL_MODELS.filter(({ model }) => {
    const c = db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length;
    return c < LOW_STOCK_THRESHOLD;
  });
  const activeWarranty = db.vehicles.filter(v => v.status === 'Sold').length;
  const expiredWarranty = db.vehicles.filter(v => v.status === 'Warranty Expired').length;

  const stockByModel = ALL_MODELS.map(({ cat, model }) => ({
    model, InStock: db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length,
    Supplied: db.vehicles.filter(v => v.model === model && v.status === 'Sent to Distributor').length,
    Sold: db.vehicles.filter(v => v.model === model && (v.status === 'Sold' || v.status === 'Warranty Expired')).length,
  }));

  const statusPie = STATUSES.map(s => ({ name: s, value: db.vehicles.filter(v => v.status === s).length })).filter(d => d.value > 0);

  const monthlySales = useMemo(() => {
    const map = {};
    db.sales.forEach(s => {
      const key = s.saleDate?.slice(0, 7);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort().map(([month, count]) => ({ month, sales: count }));
  }, [db.sales]);

  const distributorInventory = db.distributors.map(d => ({
    ...d,
    stock: db.vehicles.filter(v => v.distributorId === d.id && v.status === 'Sent to Distributor').length,
    sold: db.vehicles.filter(v => v.distributorId === d.id && (v.status === 'Sold' || v.status === 'Warranty Expired')).length,
  }));

  const recentTx = [...db.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentSales = [...db.sales].sort((a, b) => b.saleDate.localeCompare(a.saleDate)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard label="Total in Stock" value={totalStock} icon={Package} accent="#33D69F" />
        <StatCard label="Total Sold" value={totalSold} icon={TrendingUp} accent="#FFB020" />
        <StatCard label="Supplied to Distributors" value={totalSupplied} icon={Truck} accent="#4FA8FF" />
        <StatCard label="Low Stock Alerts" value={lowStockModels.length} icon={AlertTriangle} accent="#FF5C5C" />
        <StatCard label="Active Warranties" value={activeWarranty} icon={ShieldCheck} accent="#33D69F" />
        <StatCard label="Expired Warranties" value={expiredWarranty} icon={ShieldCheck} accent="#FF5C5C" />
      </div>

      {lowStockModels.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--warning)' }}>
            <AlertTriangle size={15} /> Low Stock Alerts
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {lowStockModels.map(m => m.model).join(', ')} — running below the {LOW_STOCK_THRESHOLD} unit threshold at the warehouse.
          </div>
        </div>
      )}

      <div className="admin-charts-grid">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Stock by Model</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockByModel}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="model" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="InStock" fill="#33D69F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Supplied" fill="#4FA8FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sold" fill="#FFB020" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Fleet Status Distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {statusPie.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Sales Trend (Monthly)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }} />
            <Line type="monotone" dataKey="sales" stroke="var(--accent2)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Distributor-wise Inventory</div>
        <div className="scrollx">
          <table>
            <thead><tr><th>Distributor</th><th>Status</th><th>Current Stock</th><th>Sold</th></tr></thead>
            <tbody>
              {distributorInventory.map(d => (
                <tr key={d.id}>
                  <td>{d.shopName}</td>
                  <td><span className="badge" style={{ background: d.status === 'active' ? '#33D69F22' : '#FF5C5C22', color: d.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>{d.status}</span></td>
                  <td>{d.stock}</td>
                  <td>{d.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Recent Supply Transactions</div>
          {recentTx.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No transactions yet.</div>}
          {recentTx.map(t => (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <b>{t.invoiceNumber}</b> — {t.vehicleIds.length} vehicle(s) to {db.distributors.find(d => d.id === t.distributorId)?.shopName || t.distributorId} on {fmtDate(t.date)}
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Recent Sales</div>
          {recentSales.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No sales yet.</div>}
          {recentSales.map(s => (
            <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <b>{s.vehicleId}</b> sold to {s.customer.fullName} for {inr(s.sellingPrice - s.discount)} on {fmtDate(s.saleDate)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




export function InventoryTab({ db, persist, addAudit, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [filterModel, setFilterModel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [q, setQ] = useState('');

  const filtered = db.vehicles.filter(v =>
    (filterCat === 'All' || v.category === filterCat) &&
    (filterModel === 'All' || v.model === filterModel) &&
    (filterStatus === 'All' || v.status === filterStatus) &&
    (q === '' || v.id.toLowerCase().includes(q.toLowerCase()) || v.chassisNumber.toLowerCase().includes(q.toLowerCase()) || v.motorNumber.toLowerCase().includes(q.toLowerCase()))
  );

  const summary = ALL_MODELS.map(({ cat, model }) => ({
    cat, model, count: db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length,
  }));

  const addVehicle = (data) => {
    const newDb = { ...db, vehicles: [...db.vehicles] };
    const vId = genVehicleId(newDb.seq + 1);
    newDb.seq = (newDb.seq || 0) + 1;
    newDb.vehicles.push({ ...data, id: vId, status: 'In Stock', distributorId: null });
    addAudit(newDb, 'Super Admin', `Added new vehicle ${vId} (${data.model})`);
    persist(newDb);
    showToast(`Vehicle ${vId} added to inventory`);
    setShowAdd(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {summary.map(s => (
          <div key={s.model} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.cat} · {s.model}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: s.count < LOW_STOCK_THRESHOLD ? 'var(--danger)' : 'var(--text)' }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search vehicle / chassis / motor no." value={q} onChange={e => setQ(e.target.value)} style={{ width: 220 }} />
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterModel('All'); }} style={{ width: 140 }}>
            <option>All</option>{Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterModel} onChange={e => setFilterModel(e.target.value)} style={{ width: 140 }}>
            <option>All</option>{(filterCat === 'All' ? ALL_MODELS.map(m => m.model) : CATEGORIES[filterCat]).map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Vehicle</button>
      </div>

      <div className="card scrollx">
        <table>
          <thead><tr><th>Vehicle ID</th><th>Category</th><th>Model</th><th className="hide-mobile">Chassis No.</th><th className="hide-mobile">Motor No.</th><th className="hide-mobile">Battery</th><th className="hide-mobile">Charger</th><th className="hide-mobile">Mfg Date</th><th>Status</th><th>Distributor</th></tr></thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                <td>{v.category}</td>
                <td>{v.model}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.motorNumber}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.batterySerial}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chargerSerial}</td>
                <td className="hide-mobile">{fmtDate(v.manufacturingDate)}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>{v.distributorId ? (db.distributors.find(d => d.id === v.distributorId)?.shopName || v.distributorId) : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles match your filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onSave={addVehicle} />}
    </div>
  );
}

export function AddVehicleModal({ onClose, onSave }) {
  const [cat, setCat] = useState('Passenger');
  const [model, setModel] = useState(CATEGORIES.Passenger[0]);
  const [form, setForm] = useState({
    chassisNumber: '', motorNumber: '', batterySerial: '', chargerSerial: '',
    manufacturingDate: todayStr(), purchaseDate: todayStr(),
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.chassisNumber || !form.motorNumber || !form.batterySerial || !form.chargerSerial || !form.manufacturingDate || !form.purchaseDate) {
      setError('Please fill in all fields.');
      return;
    }
    onSave({ category: cat, model, ...form });
  };

  return (
    <Modal title="Add New Vehicle" onClose={onClose}>
      <div>
        <div className="grid-2">
          <div><label>Vehicle Category</label>
            <select value={cat} onChange={e => { setCat(e.target.value); setModel(CATEGORIES[e.target.value][0]); }}>
              {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label>Vehicle Model</label>
            <select value={model} onChange={e => setModel(e.target.value)}>
              {CATEGORIES[cat].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Chassis Number</label><input value={form.chassisNumber} onChange={e => set('chassisNumber', e.target.value)} /></div>
          <div><label>Motor Number</label><input value={form.motorNumber} onChange={e => set('motorNumber', e.target.value)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Battery Serial Number</label><input value={form.batterySerial} onChange={e => set('batterySerial', e.target.value)} /></div>
          <div><label>Charger Serial Number</label><input value={form.chargerSerial} onChange={e => set('chargerSerial', e.target.value)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Manufacturing Date</label><input type="date" value={form.manufacturingDate} onChange={e => set('manufacturingDate', e.target.value)} /></div>
          <div><label>Purchase Date</label><input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></div>
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}><Plus size={14} /> Add to Inventory</div>
        </div>
      </div>
    </Modal>
  );
}




export function DistributorsTab({ db, persist, addAudit, showToast }) {
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', data }
  const [confirmDelete, setConfirmDelete] = useState(null);

  const stockOf = (id) => db.vehicles.filter(v => v.distributorId === id && v.status === 'Sent to Distributor').length;
  const soldOf = (id) => db.vehicles.filter(v => v.distributorId === id && (v.status === 'Sold' || v.status === 'Warranty Expired')).length;

  const saveDistributor = (data) => {
    const newDb = { ...db, distributors: [...db.distributors] };
    if (modal.mode === 'add') {
      const id = uid('DIST');
      newDb.distributors.push({ ...data, id, status: 'active' });
      addAudit(newDb, 'Super Admin', `Added distributor ${data.shopName}`);
      showToast(`Distributor ${data.shopName} added`);
    } else {
      const idx = newDb.distributors.findIndex(d => d.id === modal.data.id);
      newDb.distributors[idx] = { ...newDb.distributors[idx], ...data };
      addAudit(newDb, 'Super Admin', `Updated distributor ${data.shopName}`);
      showToast(`Distributor ${data.shopName} updated`);
    }
    persist(newDb);
    setModal(null);
  };

  const toggleSuspend = (d) => {
    const newDb = { ...db, distributors: db.distributors.map(x => x.id === d.id ? { ...x, status: x.status === 'active' ? 'suspended' : 'active' } : x) };
    addAudit(newDb, 'Super Admin', `${d.status === 'active' ? 'Suspended' : 'Reactivated'} distributor ${d.shopName}`);
    persist(newDb);
    showToast(`${d.shopName} ${d.status === 'active' ? 'suspended' : 'reactivated'}`);
  };

  const doDelete = (d) => {
    const newDb = { ...db, distributors: db.distributors.filter(x => x.id !== d.id) };
    addAudit(newDb, 'Super Admin', `Deleted distributor ${d.shopName}`);
    persist(newDb);
    showToast(`Distributor ${d.shopName} deleted`);
    setConfirmDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add', data: null })}><Plus size={14} /> Add Distributor</button>
      </div>
      <div className="card scrollx">
        <table>
          <thead><tr><th>Shop Name</th><th className="hide-mobile">Owner</th><th>Mobile</th><th className="hide-mobile">Email</th><th className="hide-mobile">GST</th><th className="hide-mobile">Stock</th><th className="hide-mobile">Sold</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {db.distributors.map(d => (
              <tr key={d.id}>
                <td>{d.shopName}</td>
                <td className="hide-mobile">{d.ownerName}</td>
                <td>{d.mobile}</td>
                <td className="hide-mobile">{d.email}</td>
                <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{d.gst}</td>
                <td className="hide-mobile">{stockOf(d.id)}</td>
                <td className="hide-mobile">{soldOf(d.id)}</td>
                <td><span className="badge" style={{ background: d.status === 'active' ? '#33D69F22' : '#FF5C5C22', color: d.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>{d.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setModal({ mode: 'edit', data: d })}><Edit2 size={12} /></button>
                    <button className="btn btn-sm" onClick={() => toggleSuspend(d)}>{d.status === 'active' ? 'Suspend' : 'Activate'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(d)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <DistributorModal mode={modal.mode} data={modal.data} onClose={() => setModal(null)} onSave={saveDistributor} />}

      {confirmDelete && (
        <Modal title="Delete Distributor" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ fontSize: 13 }}>Are you sure you want to permanently delete <b>{confirmDelete.shopName}</b>? This cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => doDelete(confirmDelete)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function DistributorModal({ mode, data, onClose, onSave }) {
  const [form, setForm] = useState(data || {
    shopName: '', ownerName: '', mobile: '', address: '', gst: '', email: '', username: '', password: '',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.shopName || !form.ownerName || !form.mobile || !form.gst || !form.address || !form.email || !form.username || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    onSave(form);
  };

  return (
    <Modal title={mode === 'add' ? 'Add Distributor' : 'Edit Distributor'} onClose={onClose}>
      <div>
        <div className="grid-2">
          <div><label>Shop Name</label><input value={form.shopName} onChange={e => set('shopName', e.target.value)} /></div>
          <div><label>Owner Name</label><input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} /></div>
        </div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Mobile Number</label><input value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
          <div><label>GST Number</label><input value={form.gst} onChange={e => set('gst', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><label>Address</label><input value={form.address} onChange={e => set('address', e.target.value)} /></div>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label>Username</label><input value={form.username} onChange={e => set('username', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><label>Password</label><input type="text" value={form.password} onChange={e => set('password', e.target.value)} /></div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}>Save Distributor</div>
        </div>
      </div>
    </Modal>
  );
}




export function SupplyTab({ db, persist, addAudit, showToast }) {
  const [distributorId, setDistributorId] = useState('');
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [invoice, setInvoice] = useState(genInvoice('SUP'));
  const [delivery, setDelivery] = useState('Pending');
  const [catF, setCatF] = useState('All');
  const [modelF, setModelF] = useState('All');
  const [paymentType, setPaymentType] = useState('Cash');
  const [interestRate, setInterestRate] = useState('12');
  const [dueDate, setDueDate] = useState(addMonths(todayStr(), 3));
  const [totalAmount, setTotalAmount] = useState('');

  const unitPrice = { Passenger: 105000, Loader: 148000 };
  const available = db.vehicles.filter(v => v.status === 'In Stock' &&
    (catF === 'All' || v.category === catF) && (modelF === 'All' || v.model === modelF));

  const toggleSel = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const suggestedAmount = selected.reduce((sum, vid) => {
    const veh = db.vehicles.find(v => v.id === vid);
    return sum + (unitPrice[veh?.category] || 120000);
  }, 0);

  const submit = () => {
    if (!distributorId || selected.length === 0) return;
    const amount = Number(totalAmount) || suggestedAmount;
    const txn = {
      id: uid('TXN'), distributorId, vehicleIds: selected, date, invoiceNumber: invoice, deliveryStatus: delivery,
      totalAmount: amount, paymentType, interestRate: paymentType === 'Credit' ? Number(interestRate) || 0 : 0,
      dueDate: paymentType === 'Credit' ? dueDate : null,
    };
    const newDb = { ...db, vehicles: db.vehicles.map(v => selected.includes(v.id) ? { ...v, status: 'Sent to Distributor', distributorId } : v), transactions: [...db.transactions, txn], payments: [...(db.payments || [])] };
    if (paymentType === 'Cash') {
      newDb.payments.push({ id: uid('PAY'), distributorId, transactionId: txn.id, amount, date, mode: 'Cash', note: `Full payment against ${invoice}` });
    }
    const distName = db.distributors.find(d => d.id === distributorId)?.shopName;
    addAudit(newDb, 'Super Admin', `Supplied ${selected.length} vehicle(s) to ${distName} (${paymentType}, Invoice ${invoice})`);
    persist(newDb);
    showToast(`${selected.length} vehicle(s) transferred to ${distName}`);
    setSelected([]); setInvoice(genInvoice('SUP')); setDate(todayStr()); setTotalAmount(''); setPaymentType('Cash'); setDueDate(addMonths(todayStr(), 3));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="grid-3">
          <div>
            <label>Select Distributor</label>
            <select value={distributorId} onChange={e => setDistributorId(e.target.value)}>
              <option value="">Choose distributor…</option>
              {db.distributors.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
            </select>
          </div>
          <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label>Invoice Number</label><input value={invoice} onChange={e => setInvoice(e.target.value)} /></div>
        </div>
        <div className="grid-3" style={{ marginTop: 10 }}>
          <div><label>Filter by Category</label>
            <select value={catF} onChange={e => { setCatF(e.target.value); setModelF('All'); }}>
              <option>All</option>{Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label>Filter by Model</label>
            <select value={modelF} onChange={e => setModelF(e.target.value)}>
              <option>All</option>{(catF === 'All' ? ALL_MODELS.map(m => m.model) : CATEGORIES[catF]).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label>Delivery Status</label>
            <select value={delivery} onChange={e => setDelivery(e.target.value)}>
              <option>Pending</option><option>Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Payment Terms</div>
        <div className="grid-3">
          <div><label>Payment Type</label>
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)}>
              <option>Cash</option><option>Credit</option>
            </select>
          </div>
          <div><label>Total Amount (₹)</label>
            <input type="number" placeholder={suggestedAmount ? String(suggestedAmount) : 'Auto from selection'} value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
          </div>
          {paymentType === 'Credit' ? (
            <div><label>Interest Rate (% flat)</label><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} /></div>
          ) : <div />}
        </div>
        {paymentType === 'Credit' && (
          <div className="grid-3" style={{ marginTop: 10 }}>
            <div><label>Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            <div style={{ gridColumn: 'span 2', fontSize: 12, color: 'var(--text-muted)', alignSelf: 'end', paddingBottom: 9 }}>
              Payable amount: <b style={{ color: 'var(--text)' }}>{inr((Number(totalAmount) || suggestedAmount) * (1 + (Number(interestRate) || 0) / 100))}</b> (principal + {interestRate || 0}% interest), due {fmtDate(dueDate)}.
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Select Vehicles ({selected.length} selected, quantity)</span>
        </div>
        <div className="scrollx" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table>
            <thead><tr><th></th><th>Vehicle ID</th><th className="hide-mobile">Category</th><th>Model</th><th className="hide-mobile">Chassis No.</th><th className="hide-mobile">Mfg Date</th></tr></thead>
            <tbody>
              {available.map(v => (
                <tr key={v.id} onClick={() => toggleSel(v.id)} style={{ cursor: 'pointer' }}>
                  <td><input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleSel(v.id)} style={{ width: 16 }} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                  <td className="hide-mobile">{v.category}</td><td>{v.model}</td>
                  <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                  <td className="hide-mobile">{fmtDate(v.manufacturingDate)}</td>
                </tr>
              ))}
              {available.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No in-stock vehicles match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn btn-primary" disabled={!distributorId || selected.length === 0} onClick={submit}>
            <Truck size={14} /> Transfer {selected.length || ''} Vehicle{selected.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}




export function WarrantyTab({ db, persist, addAudit, showToast }) {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const rows = db.vehicles.filter(v => v.batteryWarranty).map(v => {
    const sale = db.sales.find(s => s.vehicleId === v.id);
    return { vehicle: v, sale };
  }).filter(({ vehicle, sale }) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return vehicle.id.toLowerCase().includes(s) || vehicle.batterySerial.toLowerCase().includes(s) || (sale?.customer?.mobile || '').includes(s);
  });

  const computeStatus = (endDate) => daysUntil(endDate) < 0 ? 'Expired' : 'Active';

  const saveWarranty = (vehicleId, battery, charger) => {
    const newDb = { ...db, vehicles: db.vehicles.map(v => v.id === vehicleId ? { ...v, batteryWarranty: battery, chargerWarranty: charger } : v) };
    addAudit(newDb, 'Super Admin', `Updated warranty for vehicle ${vehicleId}`);
    persist(newDb);
    showToast(`Warranty updated for ${vehicleId}`);
    setEditing(null);
  };

  const pendingClaims = (db.claims || []).filter(c => c.status === 'Pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input placeholder="Search by Vehicle ID, Battery Number, or Customer Mobile" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 420 }} />

      {pendingClaims.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--warning)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--warning)' }}>Pending Warranty Claims ({pendingClaims.length})</div>
          {pendingClaims.map(c => (
            <div key={c.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><b>{c.vehicleId}</b> — {c.issueDescription} ({db.distributors.find(d => d.id === c.distributorId)?.shopName})</span>
              <button className="btn btn-sm" onClick={() => {
                const newDb = { ...db, claims: db.claims.map(x => x.id === c.id ? { ...x, status: 'Resolved' } : x) };
                addAudit(newDb, 'Super Admin', `Resolved warranty claim on ${c.vehicleId}`);
                persist(newDb); showToast('Claim marked resolved');
              }}>Mark Resolved</button>
            </div>
          ))}
        </div>
      )}

      <div className="card scrollx">
        <table>
          <thead><tr><th>Vehicle ID</th><th>Customer</th><th className="hide-mobile">Mobile</th><th className="hide-mobile">Battery Warranty</th><th>Battery Status</th><th className="hide-mobile">Charger Warranty</th><th>Charger Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ vehicle, sale }) => (
              <tr key={vehicle.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{vehicle.id}</td>
                <td>{sale?.customer?.fullName || '—'}</td>
                <td className="hide-mobile">{sale?.customer?.mobile || '—'}</td>
                <td className="hide-mobile">{fmtDate(vehicle.batteryWarranty.start)} → {fmtDate(vehicle.batteryWarranty.end)}</td>
                <td><span className="badge" style={{ background: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? '#33D69F22' : '#FF5C5C22', color: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{computeStatus(vehicle.batteryWarranty.end)}</span></td>
                <td className="hide-mobile">{fmtDate(vehicle.chargerWarranty.start)} → {fmtDate(vehicle.chargerWarranty.end)}</td>
                <td><span className="badge" style={{ background: computeStatus(vehicle.chargerWarranty.end) === 'Active' ? '#33D69F22' : '#FF5C5C22', color: computeStatus(vehicle.chargerWarranty.end) === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{computeStatus(vehicle.chargerWarranty.end)}</span></td>
                <td><button className="btn btn-sm" onClick={() => setEditing(vehicle)}><Edit2 size={12} /> Edit / Extend</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No matching warranty records.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`Edit Warranty — ${editing.id}`} onClose={() => setEditing(null)}>
          <WarrantyEditForm vehicle={editing} onSave={saveWarranty} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}

export function WarrantyEditForm({ vehicle, onSave, onClose }) {
  const [battery, setBattery] = useState({ ...vehicle.batteryWarranty });
  const [charger, setCharger] = useState({ ...vehicle.chargerWarranty });
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Battery Warranty</div>
      <div className="grid-2">
        <div><label>Start Date</label><input type="date" value={battery.start} onChange={e => setBattery(b => ({ ...b, start: e.target.value }))} /></div>
        <div><label>End Date</label><input type="date" value={battery.end} onChange={e => setBattery(b => ({ ...b, end: e.target.value }))} /></div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, margin: '16px 0 8px' }}>Charger Warranty</div>
      <div className="grid-2">
        <div><label>Start Date</label><input type="date" value={charger.start} onChange={e => setCharger(c => ({ ...c, start: e.target.value }))} /></div>
        <div><label>End Date</label><input type="date" value={charger.end} onChange={e => setCharger(c => ({ ...c, end: e.target.value }))} /></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <div className="btn btn-sm" onClick={() => setBattery(b => ({ ...b, end: addMonths(b.end, 6) }))}>+6mo Battery</div>
        <div className="btn btn-sm" onClick={() => setCharger(c => ({ ...c, end: addMonths(c.end, 6) }))}>+6mo Charger</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
        <div className="btn" onClick={onClose}>Cancel</div>
        <div className="btn btn-primary" onClick={() => onSave(vehicle.id, battery, charger)}>Save Warranty</div>
      </div>
    </div>
  );
}




export function ReportsTab({ db }) {
  const [reportType, setReportType] = useState('Stock Report');
  const [distFilter, setDistFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [modelFilter, setModelFilter] = useState('All');
  const [warrantyFilter, setWarrantyFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const reportTypes = ['Stock Report', 'Distributor-wise Stock', 'Vehicle Movement Report', 'Sales Report', 'Customer Report', 'Warranty Report', 'Low Stock Report', 'Daily Sales', 'Monthly Sales', 'Yearly Sales'];

  const distName = (id) => db.distributors.find(d => d.id === id)?.shopName || id;

  const inDateRange = (dateStr) => {
    if (!dateStr) return true;
    if (fromDate && dateStr < fromDate) return false;
    if (toDate && dateStr > toDate) return false;
    return true;
  };

  const buildRows = () => {
    switch (reportType) {
      case 'Stock Report':
        return db.vehicles.filter(v => (catFilter === 'All' || v.category === catFilter) && (modelFilter === 'All' || v.model === modelFilter))
          .map(v => ({ 'Vehicle ID': v.id, Category: v.category, Model: v.model, Chassis: v.chassisNumber, Motor: v.motorNumber, Status: v.status, Distributor: v.distributorId ? distName(v.distributorId) : '-' }));
      case 'Distributor-wise Stock':
        return db.distributors.filter(d => distFilter === 'All' || d.id === distFilter).map(d => ({
          Distributor: d.shopName, 'Current Stock': db.vehicles.filter(v => v.distributorId === d.id && v.status === 'Sent to Distributor').length,
          Sold: db.vehicles.filter(v => v.distributorId === d.id && (v.status === 'Sold' || v.status === 'Warranty Expired')).length, Status: d.status,
        }));
      case 'Vehicle Movement Report':
        return db.transactions.filter(t => (distFilter === 'All' || t.distributorId === distFilter) && inDateRange(t.date))
          .map(t => ({ Invoice: t.invoiceNumber, Distributor: distName(t.distributorId), 'Vehicle Count': t.vehicleIds.length, Date: fmtDate(t.date), 'Delivery Status': t.deliveryStatus }));
      case 'Sales Report':
      case 'Daily Sales':
      case 'Monthly Sales':
      case 'Yearly Sales':
        return db.sales.filter(s => (distFilter === 'All' || s.distributorId === distFilter) && inDateRange(s.saleDate))
          .map(s => ({ Invoice: s.invoiceNumber, 'Vehicle ID': s.vehicleId, Customer: s.customer.fullName, Distributor: distName(s.distributorId), 'Selling Price': s.sellingPrice, Discount: s.discount, 'Sale Date': fmtDate(s.saleDate) }));
      case 'Customer Report':
        return db.sales.map(s => ({ Customer: s.customer.fullName, Mobile: s.customer.mobile, City: s.customer.city, State: s.customer.state, 'Vehicle ID': s.vehicleId, Distributor: distName(s.distributorId), 'Sale Date': fmtDate(s.saleDate) }));
      case 'Warranty Report':
        return db.vehicles.filter(v => v.batteryWarranty).map(v => {
          const status = daysUntil(v.batteryWarranty.end) < 0 ? 'Expired' : 'Active';
          return { 'Vehicle ID': v.id, 'Battery End': fmtDate(v.batteryWarranty.end), 'Charger End': fmtDate(v.chargerWarranty.end), Status: status };
        }).filter(r => warrantyFilter === 'All' || r.Status === warrantyFilter);
      case 'Low Stock Report':
        return ALL_MODELS.map(({ cat, model }) => ({ Category: cat, Model: model, 'In Stock': db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length }))
          .filter(r => r['In Stock'] < LOW_STOCK_THRESHOLD);
      default: return [];
    }
  };

  const rows = buildRows();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="grid-3">
          <div><label>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>{reportTypes.map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <div><label>Distributor</label>
            <select value={distFilter} onChange={e => setDistFilter(e.target.value)}>
              <option value="All">All</option>{db.distributors.map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
            </select>
          </div>
          <div><label>Vehicle Category</label>
            <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setModelFilter('All'); }}>
              <option>All</option>{Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-3" style={{ marginTop: 10 }}>
          <div><label>Model</label>
            <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
              <option>All</option>{(catFilter === 'All' ? ALL_MODELS.map(m => m.model) : CATEGORIES[catFilter]).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label>From Date</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div><label>To Date</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
        </div>
        {reportType === 'Warranty Report' && (
          <div style={{ marginTop: 10, maxWidth: 220 }}>
            <label>Warranty Status</label>
            <select value={warrantyFilter} onChange={e => setWarrantyFilter(e.target.value)}>
              <option>All</option><option>Active</option><option>Expired</option>
            </select>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => csvDownload(`${reportType.replace(/\s/g, '_')}.csv`, rows)}><Download size={14} /> Export CSV</button>
          <button className="btn" onClick={() => excelDownload(`${reportType.replace(/\s/g, '_')}.xlsx`, rows, reportType)}><Download size={14} /> Export Excel</button>
          <button className="btn" onClick={() => printReport(reportType, rows)}><FileText size={14} /> Print / Save as PDF</button>
        </div>
      </div>

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{reportType} Preview ({rows.length} rows)</div>
        {rows.length > 0 ? (
          <table>
            <thead><tr>{Object.keys(rows[0]).map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 50).map((r, i) => <tr key={i}>{Object.keys(rows[0]).map(h => <td key={h}>{typeof r[h] === 'number' && h.toLowerCase().includes('price') ? inr(r[h]) : r[h]}</td>)}</tr>)}
            </tbody>
          </table>
        ) : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No records for the selected filters.</div>}
      </div>
    </div>
  );
}




export function SearchTab({ db }) {
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();

  const vehicles = s ? db.vehicles.filter(v => v.id.toLowerCase().includes(s) || v.chassisNumber.toLowerCase().includes(s) || v.motorNumber.toLowerCase().includes(s) || v.batterySerial.toLowerCase().includes(s)) : [];
  const customers = s ? db.sales.filter(sale => sale.customer.fullName.toLowerCase().includes(s) || sale.customer.mobile.includes(s)) : [];
  const distributors = s ? db.distributors.filter(d => d.shopName.toLowerCase().includes(s)) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ position: 'relative', maxWidth: 480 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        <input style={{ paddingLeft: 34 }} placeholder="Search by Vehicle ID, Chassis, Motor No., Battery, Customer, or Distributor" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {s && (
        <>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Vehicles ({vehicles.length})</div>
            {vehicles.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No matches.</div>}
            {vehicles.map(v => (
              <div key={v.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <b style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</b> — {v.category} {v.model} · <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Customers ({customers.length})</div>
            {customers.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No matches.</div>}
            {customers.map(c => (
              <div key={c.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <b>{c.customer.fullName}</b> — {c.customer.mobile} · bought {c.vehicleId}
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Distributors ({distributors.length})</div>
            {distributors.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No matches.</div>}
            {distributors.map(d => (
              <div key={d.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <b>{d.shopName}</b> — {d.ownerName} · {d.mobile}
              </div>
            ))}
          </div>
        </>
      )}
      {!s && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Start typing to search across the entire system.</div>}
    </div>
  );
}




export function AuditTab({ db }) {
  return (
    <div className="card scrollx">
      <table>
        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th></tr></thead>
        <tbody>
          {db.auditLog.map(a => (
            <tr key={a.id}><td>{new Date(a.timestamp).toLocaleString('en-IN')}</td><td>{a.user}</td><td>{a.action}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
