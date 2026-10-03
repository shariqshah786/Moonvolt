"use client";
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import {
  LayoutDashboard, Package, Users, Truck, ShieldCheck, FileText, Search,
  Bell, Sun, Moon, LogOut, Plus, Edit2, Trash2, X, Check, AlertTriangle,
  ChevronDown, Download, Menu, Car, TrendingUp, ClipboardList, UserCircle2,
  ScrollText, Filter, Eye, EyeOff, RefreshCw, IndianRupee, MapPin, Megaphone,
  Landmark, Sparkles, Wallet, BadgeCheck, HandCoins, CalendarClock, Percent,
  MessageSquare, History, ExternalLink, FileCheck2, BatteryFull, Paperclip, Wrench
} from 'lucide-react';
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS, STORAGE_KEY, PAYMENT_MODES, ANNOUNCEMENT_TYPES, SMS_TYPES, ADMIN_CREDENTIALS } from '../../lib/constants';
import { uid, pad4, genVehicleId, genInvoice, fmtDate, todayStr, addMonths, daysUntil, inr, csvDownload, excelDownload, printReport, billingOf, billingTotals } from '../../lib/helpers';
import { StatCard, StatusBadge, Modal, grid2, grid3 } from '../ui/SharedUI';



export function AdminDashboard({ db }) {
  const totalStock = db.vehicles.filter(v => v.status === 'In Stock').length;
  const totalSold = db.vehicles.filter(v => v.status === 'Sold' || v.status === 'Warranty Expired').length;
  const totalSupplied = db.vehicles.filter(v => v.status === 'Sent to Distributor').length;
  const lowStockModels = ALL_MODELS.filter(({ model }) => {
    const c = db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length;
    return c > 0 && c < LOW_STOCK_THRESHOLD;
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }} className="stat-card-grid">
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
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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

  const updateVehicle = (vehicleId, updates) => {
    const newDb = { ...db, vehicles: db.vehicles.map(v => v.id === vehicleId ? { ...v, ...updates } : v) };
    addAudit(newDb, 'Super Admin', `Updated vehicle ${vehicleId} (battery/motor/warranty details)`);
    persist(newDb);
    showToast(`Vehicle ${vehicleId} updated`);
    setEditing(null);
  };

  const deleteVehicle = (vehicle) => {
    const newDb = {
      ...db,
      vehicles: db.vehicles.filter(v => v.id !== vehicle.id)
    };
    addAudit(newDb, 'Super Admin', `Deleted vehicle ${vehicle.id} (${vehicle.model})`);
    persist(newDb);
    showToast(`Vehicle ${vehicle.id} deleted from inventory`);
    setConfirmDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }} className="stat-card-grid">
        {summary.map(s => (
          <div key={s.model} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.cat} · {s.model}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: s.count < LOW_STOCK_THRESHOLD ? 'var(--danger)' : 'var(--text)' }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar-responsive">
        <div className="filter-inputs-group">
          <input placeholder="Search vehicle / chassis / motor no." value={q} onChange={e => setQ(e.target.value)} style={{ flex: '1 1 200px' }} />
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterModel('All'); }} style={{ flex: '1 1 120px' }}>
            <option>All</option>{Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterModel} onChange={e => setFilterModel(e.target.value)} style={{ flex: '1 1 120px' }}>
            <option>All</option>{(filterCat === 'All' ? ALL_MODELS.map(m => m.model) : CATEGORIES[filterCat]).map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: '1 1 140px' }}>
            <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Vehicle</button>
      </div>

      <div className="card scrollx">
        <table>
          <thead><tr><th>Vehicle ID</th><th>Category</th><th>Model</th><th>Chassis No.</th><th>Motor No.</th><th>Battery</th><th>Charger</th><th>Mfg Date</th><th>Status</th><th>Distributor</th><th>Warranty</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                <td>{v.category}</td>
                <td>{v.model}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.motorNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.batterySerial}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chargerSerial}</td>
                <td>{fmtDate(v.manufacturingDate)}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>{v.distributorId ? (db.distributors.find(d => d.id === v.distributorId)?.shopName || v.distributorId) : '—'}</td>
                <td>{v.batteryWarranty ? <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>Set</span> : <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>None</span>}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setEditing(v)}><Edit2 size={12} /> Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(v)}><Trash2 size={12} /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles match your filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onSave={addVehicle} />}
      {editing && <EditVehicleModal vehicle={editing} onClose={() => setEditing(null)} onSave={updateVehicle} />}

      {confirmDelete && (
        <Modal title="Delete Vehicle" onClose={() => setConfirmDelete(null)} width={420}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Are you sure you want to permanently delete vehicle <b>{confirmDelete.id}</b> ({confirmDelete.model}) from inventory? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteVehicle(confirmDelete)}>
                <Trash2 size={14} /> Delete Vehicle
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function EditVehicleModal({ vehicle, onClose, onSave }) {
  const [category, setCategory] = useState(vehicle.category || 'Passenger');
  const [model, setModel] = useState(vehicle.model || CATEGORIES.Passenger[0]);
  const [chassisNumber, setChassisNumber] = useState(vehicle.chassisNumber || '');
  const [motorNumber, setMotorNumber] = useState(vehicle.motorNumber || '');
  const [batterySerial, setBatterySerial] = useState(vehicle.batterySerial || '');
  const [chargerSerial, setChargerSerial] = useState(vehicle.chargerSerial || '');
  const [manufacturingDate, setManufacturingDate] = useState(vehicle.manufacturingDate || todayStr());
  const [purchaseDate, setPurchaseDate] = useState(vehicle.purchaseDate || todayStr());
  const [battery, setBattery] = useState(vehicle.batteryWarranty ? { ...vehicle.batteryWarranty } : null);
  const [charger, setCharger] = useState(vehicle.chargerWarranty ? { ...vehicle.chargerWarranty } : null);
  const [error, setError] = useState('');

  const initWarranty = () => {
    const start = todayStr();
    setBattery({ start, end: addMonths(start, BATTERY_WARRANTY_MONTHS) });
    setCharger({ start, end: addMonths(start, CHARGER_WARRANTY_MONTHS) });
  };

  const submit = () => {
    if (!chassisNumber || !motorNumber || !batterySerial || !chargerSerial) {
      setError('Chassis, motor, battery, and charger numbers cannot be empty.');
      return;
    }
    onSave(vehicle.id, {
      category,
      model,
      chassisNumber,
      motorNumber,
      batterySerial,
      chargerSerial,
      manufacturingDate,
      purchaseDate,
      batteryWarranty: battery,
      chargerWarranty: charger,
    });
  };

  return (
    <Modal title={`Edit / Update Vehicle — ${vehicle.id}`} onClose={onClose}>
      <div>
        <div className="grid-2">
          <div>
            <label>Vehicle Category</label>
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setModel(CATEGORIES[e.target.value][0]);
              }}
            >
              {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Vehicle Model</label>
            <select value={model} onChange={e => setModel(e.target.value)}>
              {(CATEGORIES[category] || []).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Chassis Number</label><input value={chassisNumber} onChange={e => setChassisNumber(e.target.value)} /></div>
          <div><label>Motor Number</label><input value={motorNumber} onChange={e => setMotorNumber(e.target.value)} /></div>
        </div>

        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Battery Serial Number</label><input value={batterySerial} onChange={e => setBatterySerial(e.target.value)} /></div>
          <div><label>Charger Serial Number</label><input value={chargerSerial} onChange={e => setChargerSerial(e.target.value)} /></div>
        </div>

        <div className="grid-2" style={{ marginTop: 10 }}>
          <div><label>Manufacturing Date</label><input type="date" value={manufacturingDate} onChange={e => setManufacturingDate(e.target.value)} /></div>
          <div><label>Purchase Date</label><input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, margin: '18px 0 8px' }}>Warranty Management</div>
        {!battery ? (
          <div className="btn" onClick={initWarranty}><ShieldCheck size={14} /> Initialize Warranty (24mo battery / 12mo charger)</div>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Battery Warranty</div>
            <div className="grid-2">
              <div><label>Start Date</label><input type="date" value={battery.start} onChange={e => setBattery(b => ({ ...b, start: e.target.value }))} /></div>
              <div><label>End Date</label><input type="date" value={battery.end} onChange={e => setBattery(b => ({ ...b, end: e.target.value }))} /></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', margin: '10px 0 6px' }}>Charger Warranty</div>
            <div className="grid-2">
              <div><label>Start Date</label><input type="date" value={charger.start} onChange={e => setCharger(c => ({ ...c, start: e.target.value }))} /></div>
              <div><label>End Date</label><input type="date" value={charger.end} onChange={e => setCharger(c => ({ ...c, end: e.target.value }))} /></div>
            </div>
          </>
        )}

        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}>Update Vehicle</div>
        </div>
      </div>
    </Modal>
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
          <thead><tr><th>Shop Name</th><th>Owner</th><th>Mobile</th><th>Email</th><th>GST</th><th>Stock</th><th>Sold</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {db.distributors.map(d => (
              <tr key={d.id}>
                <td>{d.shopName}</td>
                <td>{d.ownerName}</td>
                <td>{d.mobile}</td>
                <td>{d.email}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{d.gst || '—'}</td>
                <td>{stockOf(d.id)}</td>
                <td>{soldOf(d.id)}</td>
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
            {db.distributors.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No distributors registered yet. Click "Add Distributor" to onboard one.</td></tr>
            )}
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
    if (!form.shopName || !form.ownerName || !form.mobile || !form.address || !form.email || !form.username || !form.password) {
      setError('Please fill in required fields (Shop name, Owner, Mobile, Address, Email, Username, Password).');
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
          <div><label>GST Number (optional)</label><input value={form.gst} onChange={e => set('gst', e.target.value)} placeholder="Optional" /></div>
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
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsSchedule, setSmsSchedule] = useState(`${todayStr()}T09:00`);
  const [smsMessage, setSmsMessage] = useState('');

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
    const newDb = { ...db, vehicles: db.vehicles.map(v => selected.includes(v.id) ? { ...v, status: 'Sent to Distributor', distributorId } : v), transactions: [...db.transactions, txn], payments: [...(db.payments || [])], scheduledSms: [...(db.scheduledSms || [])] };
    if (paymentType === 'Cash') {
      newDb.payments.push({ id: uid('PAY'), distributorId, transactionId: txn.id, amount, date, mode: 'Cash', note: `Full payment against ${invoice}` });
    }
    const distName = db.distributors.find(d => d.id === distributorId)?.shopName;
    if (smsEnabled) {
      const dist = db.distributors.find(d => d.id === distributorId);
      const message = smsMessage || `Hi ${dist?.ownerName || ''}, ${selected.length} vehicle(s) (Invoice ${invoice}) have been dispatched to ${dist?.shopName}. Track status in your MoonVolt VDMS distributor login.`;
      newDb.scheduledSms.push({ id: uid('SMS'), distributorId, type: 'Delivery Confirmation', message, mobile: dist?.mobile, scheduledFor: smsSchedule, relatedInvoice: invoice, status: 'Scheduled' });
    }
    addAudit(newDb, 'Super Admin', `Supplied ${selected.length} vehicle(s) to ${distName} (${paymentType}, Invoice ${invoice})${smsEnabled ? ' · SMS scheduled' : ''}`);
    persist(newDb);
    showToast(`${selected.length} vehicle(s) transferred to ${distName}${smsEnabled ? ' · SMS scheduled' : ''}`);
    setSelected([]); setInvoice(genInvoice('SUP')); setDate(todayStr()); setTotalAmount(''); setPaymentType('Cash'); setDueDate(addMonths(todayStr(), 3));
    setSmsMessage(''); setSmsSchedule(`${todayStr()}T09:00`);
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
          <div style={{ ...grid3, marginTop: 10 }}>
            <div><label>Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            <div style={{ gridColumn: 'span 2', fontSize: 12, color: 'var(--text-muted)', alignSelf: 'end', paddingBottom: 9 }}>
              Payable amount: <b style={{ color: 'var(--text)' }}>{inr((Number(totalAmount) || suggestedAmount) * (1 + (Number(interestRate) || 0) / 100))}</b> (principal + {interestRate || 0}% interest), due {fmtDate(dueDate)}.
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Delivery SMS Notification</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={smsEnabled} onChange={e => setSmsEnabled(e.target.checked)} style={{ width: 16 }} />
            <span style={{ fontSize: 12, color: 'var(--text)' }}>Notify distributor by SMS</span>
          </label>
        </div>
        {smsEnabled && (
          <>
            <div className="grid-2">
              <div><label>Schedule Date &amp; Time</label><input type="datetime-local" value={smsSchedule} onChange={e => setSmsSchedule(e.target.value)} /></div>
              <div><label>Distributor Mobile</label><input value={db.distributors.find(d => d.id === distributorId)?.mobile || ''} disabled /></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label>Message (leave blank to auto-generate)</label>
              <input value={smsMessage} onChange={e => setSmsMessage(e.target.value)} placeholder={`e.g. Your vehicles for Invoice ${invoice} are on the way…`} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>This is a demo simulation — no real SMS is sent, but the notification is queued and shown below.</div>
          </>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Select Vehicles ({selected.length} selected, quantity)</span>
        </div>
        <div className="scrollx" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table>
            <thead><tr><th></th><th>Vehicle ID</th><th>Category</th><th>Model</th><th>Chassis No.</th><th>Mfg Date</th></tr></thead>
            <tbody>
              {available.map(v => (
                <tr key={v.id} onClick={() => toggleSel(v.id)} style={{ cursor: 'pointer' }}>
                  <td><input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleSel(v.id)} style={{ width: 16 }} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                  <td>{v.category}</td><td>{v.model}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.chassisNumber}</td>
                  <td>{fmtDate(v.manufacturingDate)}</td>
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

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Scheduled SMS Notifications</div>
        <table>
          <thead><tr><th>Distributor</th><th>Type</th><th>Message</th><th>Scheduled For</th><th>Status</th></tr></thead>
          <tbody>
            {[...(db.scheduledSms || [])].sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor)).map(s => {
              const sent = new Date(s.scheduledFor) <= new Date();
              return (
                <tr key={s.id}>
                  <td>{db.distributors.find(d => d.id === s.distributorId)?.shopName || s.distributorId}</td>
                  <td>{s.type}</td>
                  <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{s.message}</td>
                  <td>{new Date(s.scheduledFor).toLocaleString('en-IN')}</td>
                  <td><span className="badge" style={{ background: sent ? '#33D69F22' : '#FFB02022', color: sent ? 'var(--success)' : 'var(--warning)' }}>{sent ? 'Sent' : 'Scheduled'}</span></td>
                </tr>
              );
            })}
            {(db.scheduledSms || []).length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No SMS notifications scheduled yet.</td></tr>}
          </tbody>
        </table>
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
          <thead><tr><th>Vehicle ID</th><th>Customer</th><th>Mobile</th><th>Battery Warranty</th><th>Battery Status</th><th>Charger Warranty</th><th>Charger Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ vehicle, sale }) => (
              <tr key={vehicle.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{vehicle.id}</td>
                <td>{sale?.customer?.fullName || '—'}</td>
                <td>{sale?.customer?.mobile || '—'}</td>
                <td>{fmtDate(vehicle.batteryWarranty.start)} → {fmtDate(vehicle.batteryWarranty.end)}</td>
                <td><span className="badge" style={{ background: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? '#33D69F22' : '#FF5C5C22', color: computeStatus(vehicle.batteryWarranty.end) === 'Active' ? 'var(--success)' : 'var(--danger)' }}>{computeStatus(vehicle.batteryWarranty.end)}</span></td>
                <td>{fmtDate(vehicle.chargerWarranty.start)} → {fmtDate(vehicle.chargerWarranty.end)}</td>
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
        <div style={{ ...grid3, marginTop: 10 }}>
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




export function txnFinance(t, payments) {
  const interest = t.paymentType === 'Credit' ? Math.round((t.totalAmount || 0) * (t.interestRate || 0) / 100) : 0;
  const payable = (t.totalAmount || 0) + interest;
  const paid = payments.filter(p => p.transactionId === t.id).reduce((s, p) => s + p.amount, 0);
  const balance = payable - paid;
  const overdue = t.paymentType === 'Credit' && balance > 0 && t.dueDate && daysUntil(t.dueDate) < 0;
  return { interest, payable, paid, balance, overdue };
}




export function FinanceTab({ db, persist, addAudit, showToast }) {
  const [showPayment, setShowPayment] = useState(false);
  const [distFilter, setDistFilter] = useState('All');
  const [managing, setManaging] = useState(null);

  const summary = db.distributors.map(d => {
    const txns = db.transactions.filter(t => t.distributorId === d.id);
    let billed = 0, interest = 0, payable = 0, paid = 0, overdueCount = 0;
    txns.forEach(t => {
      const f = txnFinance(t, db.payments || []);
      billed += t.totalAmount || 0; interest += f.interest; payable += f.payable; paid += f.paid;
      if (f.overdue) overdueCount++;
    });
    return { ...d, billed, interest, payable, paid, pending: payable - paid, overdueCount };
  });

  const totals = summary.reduce((a, d) => ({ billed: a.billed + d.billed, paid: a.paid + d.paid, pending: a.pending + d.pending }), { billed: 0, paid: 0, pending: 0 });

  const creditTxns = db.transactions.filter(t => t.paymentType === 'Credit' && (distFilter === 'All' || t.distributorId === distFilter));

  const recordPayment = (data) => {
    const newDb = { ...db, payments: [...(db.payments || []), { id: uid('PAY'), ...data }] };
    const distName = db.distributors.find(d => d.id === data.distributorId)?.shopName;
    addAudit(newDb, 'Super Admin', `Recorded payment of ${inr(data.amount)} from ${distName} (${data.mode})`);
    persist(newDb);
    showToast(`Payment of ${inr(data.amount)} recorded`);
    setShowPayment(false);
  };

  const saveCollection = (txnId, { newDueDate, sendReminder, reminderSchedule, reminderMessage }) => {
    const txn = db.transactions.find(t => t.id === txnId);
    const distName = db.distributors.find(d => d.id === txn.distributorId)?.shopName;
    const newDb = { ...db, transactions: db.transactions.map(t => t.id === txnId ? { ...t, dueDate: newDueDate } : t), scheduledSms: [...(db.scheduledSms || [])] };
    if (sendReminder) {
      const dist = db.distributors.find(d => d.id === txn.distributorId);
      newDb.scheduledSms.push({ id: uid('SMS'), distributorId: txn.distributorId, type: 'Payment Reminder', message: reminderMessage, mobile: dist?.mobile, scheduledFor: reminderSchedule, relatedInvoice: txn.invoiceNumber, status: 'Scheduled' });
    }
    addAudit(newDb, 'Super Admin', `Updated collection terms for ${distName} on invoice ${txn.invoiceNumber}${sendReminder ? ' · SMS reminder scheduled' : ''}`);
    persist(newDb);
    showToast('Collection details updated');
    setManaging(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard label="Total Billed" value={inr(totals.billed)} icon={IndianRupee} accent="#3B82F6" />
        <StatCard label="Total Collected" value={inr(totals.paid)} icon={Wallet} accent="#33D69F" />
        <StatCard label="Total Pending" value={inr(totals.pending)} icon={CalendarClock} accent="#FF5C5C" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowPayment(true)}><Plus size={14} /> Record Payment</button>
      </div>

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Distributor-wise Ledger</div>
        <table>
          <thead><tr><th>Distributor</th><th>Billed</th><th>Interest</th><th>Payable</th><th>Paid</th><th>Pending</th><th>Status</th></tr></thead>
          <tbody>
            {summary.map(d => (
              <tr key={d.id}>
                <td>{d.shopName}</td>
                <td>{inr(d.billed)}</td>
                <td>{inr(d.interest)}</td>
                <td>{inr(d.payable)}</td>
                <td>{inr(d.paid)}</td>
                <td style={{ color: d.pending > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>{inr(d.pending)}</td>
                <td>{d.overdueCount > 0 ? <span className="badge" style={{ background: '#FF5C5C22', color: 'var(--danger)' }}>{d.overdueCount} Overdue</span> : <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>Up to date</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card scrollx">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Credit Invoices (Loans to Distributors)</span>
          <select value={distFilter} onChange={e => setDistFilter(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="All">All Distributors</option>
            {db.distributors.map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
          </select>
        </div>
        <table>
          <thead><tr><th>Invoice</th><th>Distributor</th><th>Principal</th><th>Interest Rate</th><th>Interest</th><th>Payable</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {creditTxns.map(t => {
              const f = txnFinance(t, db.payments || []);
              const distName = db.distributors.find(d => d.id === t.distributorId)?.shopName;
              return (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.invoiceNumber}</td>
                  <td>{distName}</td>
                  <td>{inr(t.totalAmount)}</td>
                  <td>{t.interestRate}%</td>
                  <td>{inr(f.interest)}</td>
                  <td>{inr(f.payable)}</td>
                  <td>{inr(f.paid)}</td>
                  <td style={{ fontWeight: 700, color: f.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>{inr(f.balance)}</td>
                  <td>{fmtDate(t.dueDate)}</td>
                  <td>{f.balance <= 0 ? <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>Closed</span> : f.overdue ? <span className="badge" style={{ background: '#FF5C5C22', color: 'var(--danger)' }}>Overdue</span> : <span className="badge" style={{ background: '#FFB02022', color: 'var(--warning)' }}>Active</span>}</td>
                  <td>{f.balance > 0 && <button className="btn btn-sm" onClick={() => setManaging(t)}><Wrench size={12} /> Manage</button>}</td>
                </tr>
              );
            })}
            {creditTxns.length === 0 && <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No credit invoices.</td></tr>}
          </tbody>
        </table>
      </div>

      {managing && <CollectionModal db={db} txn={managing} onClose={() => setManaging(null)} onSave={saveCollection} />}

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Payment History</div>
        <table>
          <thead><tr><th>Date</th><th>Distributor</th><th>Amount</th><th>Mode</th><th>Note</th></tr></thead>
          <tbody>
            {[...(db.payments || [])].sort((a, b) => b.date.localeCompare(a.date)).map(p => (
              <tr key={p.id}>
                <td>{fmtDate(p.date)}</td>
                <td>{db.distributors.find(d => d.id === p.distributorId)?.shopName || p.distributorId}</td>
                <td>{inr(p.amount)}</td>
                <td>{p.mode}</td>
                <td>{p.note}</td>
              </tr>
            ))}
            {(db.payments || []).length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showPayment && <RecordPaymentModal db={db} onClose={() => setShowPayment(false)} onSave={recordPayment} />}
    </div>
  );
}

export function RecordPaymentModal({ db, onClose, onSave }) {
  const [distributorId, setDistributorId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const openTxns = db.transactions.filter(t => t.distributorId === distributorId && t.paymentType === 'Credit').map(t => {
    const f = txnFinance(t, db.payments || []);
    return { ...t, balance: f.balance };
  }).filter(t => t.balance > 0);

  const submit = () => {
    if (!distributorId || !amount) { setError('Please choose a distributor and enter an amount.'); return; }
    onSave({ distributorId, transactionId: transactionId || null, amount: Number(amount), mode, date, note: note || (transactionId ? `Payment against ${db.transactions.find(t => t.id === transactionId)?.invoiceNumber}` : 'General payment') });
  };

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <div>
        <div className="grid-2">
          <div><label>Distributor</label>
            <select value={distributorId} onChange={e => { setDistributorId(e.target.value); setTransactionId(''); }}>
              <option value="">Choose distributor…</option>
              {db.distributors.map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
            </select>
          </div>
          <div><label>Against Invoice (optional)</label>
            <select value={transactionId} onChange={e => setTransactionId(e.target.value)}>
              <option value="">General / not linked</option>
              {openTxns.map(t => <option key={t.id} value={t.id}>{t.invoiceNumber} — balance {inr(t.balance)}</option>)}
            </select>
          </div>
        </div>
        <div style={{ ...grid2, marginTop: 10 }}>
          <div><label>Amount (₹)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div><label>Payment Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</select>
          </div>
        </div>
        <div style={{ ...grid2, marginTop: 10 }}>
          <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label>Note</label><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" /></div>
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}><Wallet size={14} /> Save Payment</div>
        </div>
      </div>
    </Modal>
  );
}




export function CollectionModal({ db, txn, onClose, onSave }) {
  const f = txnFinance(txn, db.payments || []);
  const distName = db.distributors.find(d => d.id === txn.distributorId)?.shopName;
  const [newDueDate, setNewDueDate] = useState(txn.dueDate || todayStr());
  const [sendReminder, setSendReminder] = useState(true);
  const [reminderSchedule, setReminderSchedule] = useState(`${todayStr()}T09:00`);
  const [reminderMessage, setReminderMessage] = useState(`Reminder: an amount of ${inr(f.balance)} is pending against Invoice ${txn.invoiceNumber}. Please arrange payment at the earliest.`);

  const submit = () => onSave(txn.id, { newDueDate, sendReminder, reminderSchedule, reminderMessage });

  return (
    <Modal title={`Manage Collection — ${txn.invoiceNumber}`} onClose={onClose}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {distName} · Balance due: <b style={{ color: 'var(--danger)' }}>{inr(f.balance)}</b>
        </div>
        <label>Extend / Update Due Date</label>
        <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 10px' }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Send SMS Payment Reminder</span>
          <input type="checkbox" checked={sendReminder} onChange={e => setSendReminder(e.target.checked)} style={{ width: 16 }} />
        </div>
        {sendReminder && (
          <>
            <label>Schedule Date &amp; Time</label>
            <input type="datetime-local" value={reminderSchedule} onChange={e => setReminderSchedule(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <label>Message</label>
              <input value={reminderMessage} onChange={e => setReminderMessage(e.target.value)} />
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}><MessageSquare size={14} /> Save</div>
        </div>
      </div>
    </Modal>
  );
}




export function SalesLocationsTab({ db }) {
  const [distFilter, setDistFilter] = useState('All');

  const filteredSales = db.sales.filter(s => distFilter === 'All' || s.distributorId === distFilter);

  const byLocation = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      const key = `${s.customer.city}, ${s.customer.state}`;
      if (!map[key]) map[key] = { location: key, city: s.customer.city, state: s.customer.state, count: 0, distributors: new Set(), lastSale: s.saleDate };
      map[key].count++;
      map[key].distributors.add(db.distributors.find(d => d.id === s.distributorId)?.shopName || s.distributorId);
      if (s.saleDate > map[key].lastSale) map[key].lastSale = s.saleDate;
    });
    return Object.values(map).map(v => ({ ...v, distributors: [...v.distributors].join(', ') })).sort((a, b) => b.count - a.count);
  }, [filteredSales, db.distributors]);

  const chartData = byLocation.slice(0, 10).map(l => ({ location: l.city, sales: l.count }));

  const exportRows = () => byLocation.map(l => ({ City: l.city, State: l.state, 'Vehicles Sold': l.count, Distributors: l.distributors, 'Last Sale': fmtDate(l.lastSale) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <select value={distFilter} onChange={e => setDistFilter(e.target.value)} style={{ maxWidth: 240 }}>
          <option value="All">All Distributors</option>
          {db.distributors.map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
        </select>
        <button className="btn" onClick={() => csvDownload('sales_by_location.csv', exportRows())}><Download size={14} /> Export CSV</button>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Top Selling Locations</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="location" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }} />
            <Bar dataKey="sales" fill="var(--accent2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card scrollx">
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Where Distributors Are Selling</div>
        <table>
          <thead><tr><th>City</th><th>State</th><th>Vehicles Sold</th><th>Distributor(s)</th><th>Last Sale</th></tr></thead>
          <tbody>
            {byLocation.map(l => (
              <tr key={l.location}>
                <td>{l.city}</td><td>{l.state}</td><td>{l.count}</td><td>{l.distributors}</td><td>{fmtDate(l.lastSale)}</td>
              </tr>
            ))}
            {byLocation.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}




export function AnnouncementsTab({ db, persist, addAudit, showToast, isAdmin, session }) {
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const sorted = [...(db.announcements || [])].sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  const addAnnouncement = (data) => {
    const newDb = { ...db, announcements: [{ id: uid('ANN'), createdDate: todayStr(), ...data }, ...(db.announcements || [])] };
    addAudit(newDb, session.name, `Posted announcement: ${data.title}`);
    persist(newDb);
    showToast('Announcement posted');
    setShowAdd(false);
  };

  const deleteAnnouncement = (a) => {
    const newDb = { ...db, announcements: (db.announcements || []).filter(x => x.id !== a.id) };
    addAudit(newDb, session.name, `Removed announcement: ${a.title}`);
    persist(newDb);
    showToast('Announcement removed');
    setConfirmDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Announcement</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: a.type === 'Upcoming Product' ? '#3B82F622' : '#33D69F22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {a.type === 'Upcoming Product' ? <Sparkles size={16} color="var(--accent2)" /> : <Megaphone size={16} color="var(--success)" />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</span>
                <span className="badge" style={{ background: a.type === 'Upcoming Product' ? '#3B82F622' : '#33D69F22', color: a.type === 'Upcoming Product' ? 'var(--accent2)' : 'var(--success)' }}>{a.type}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>{a.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
                Posted {fmtDate(a.createdDate)}{a.expectedDate ? ` · Expected ${fmtDate(a.expectedDate)}` : ''}
              </div>
            </div>
            {isAdmin && (
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(a)}><Trash2 size={12} /></button>
            )}
          </div>
        ))}
        {sorted.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No announcements yet.</div>}
      </div>

      {showAdd && <AddAnnouncementModal onClose={() => setShowAdd(false)} onSave={addAnnouncement} />}

      {confirmDelete && (
        <Modal title="Remove Announcement" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ fontSize: 13 }}>Remove "<b>{confirmDelete.title}</b>" from the announcements feed?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <div className="btn" onClick={() => setConfirmDelete(null)}>Cancel</div>
            <div className="btn btn-danger" onClick={() => deleteAnnouncement(confirmDelete)}>Remove</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AddAnnouncementModal({ onClose, onSave }) {
  const [type, setType] = useState(ANNOUNCEMENT_TYPES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title || !description) { setError('Please fill in the title and description.'); return; }
    onSave({ type, title, description, expectedDate });
  };

  return (
    <Modal title="New Announcement" onClose={onClose}>
      <div>
        <div className="grid-2">
          <div><label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>{ANNOUNCEMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div><label>Expected Date (optional)</label><input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New 60V Loader Model" /></div>
        <div style={{ marginTop: 10 }}><label>Description</label><textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Details distributors should know…" /></div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <div className="btn" onClick={onClose}>Cancel</div>
          <div className="btn btn-primary" onClick={submit}><Megaphone size={14} /> Post Announcement</div>
        </div>
      </div>
    </Modal>
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




export function AdminSalesTab({ db }) {
  const [distFilter, setDistFilter] = useState('All');
  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState(null);

  const sales = [...db.sales].filter(s => (distFilter === 'All' || s.distributorId === distFilter) &&
    (q === '' || s.customer.fullName.toLowerCase().includes(q.toLowerCase()) || s.customer.mobile.includes(q) || s.vehicleId.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.saleDate.localeCompare(a.saleDate));

  const exportRows = () => sales.map(s => ({ Invoice: s.invoiceNumber, 'Vehicle ID': s.vehicleId, Customer: s.customer.fullName, Mobile: s.customer.mobile, City: s.customer.city, Distributor: db.distributors.find(d => d.id === s.distributorId)?.shopName, 'Selling Price': s.sellingPrice, 'Sale Date': fmtDate(s.saleDate) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search customer name / mobile / vehicle ID" value={q} onChange={e => setQ(e.target.value)} style={{ width: 260 }} />
          <select value={distFilter} onChange={e => setDistFilter(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="All">All Distributors</option>
            {db.distributors.map(d => <option key={d.id} value={d.id}>{d.shopName}</option>)}
          </select>
        </div>
        <button className="btn" onClick={() => csvDownload('all_sales.csv', exportRows())}><Download size={14} /> Export CSV</button>
      </div>
      <div className="card scrollx">
        <table>
          <thead><tr><th>Invoice</th><th>Vehicle ID</th><th>Customer</th><th>Mobile</th><th>City</th><th>Distributor</th><th>Price</th><th>Payment Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {sales.map(s => {
              const t = billingTotals(billingOf(s));
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.invoiceNumber}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.vehicleId}</td>
                  <td>{s.customer.fullName}</td>
                  <td>{s.customer.mobile}</td>
                  <td>{s.customer.city}</td>
                  <td>{db.distributors.find(d => d.id === s.distributorId)?.shopName || s.distributorId}</td>
                  <td>{inr(s.sellingPrice)}</td>
                  <td>
                    {t.status === 'Paid' && <span className="badge" style={{ background: '#33D69F22', color: 'var(--success)' }}>Paid</span>}
                    {t.status !== 'Paid' && <span className="badge" style={{ background: t.overdue ? '#FF5C5C22' : '#FFB02022', color: t.overdue ? 'var(--danger)' : 'var(--warning)' }}>{t.overdue ? 'Overdue' : t.status}</span>}
                  </td>
                  <td>{fmtDate(s.saleDate)}</td>
                  <td><span onClick={() => setViewing(s)} style={{ color: 'var(--accent2)', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> View Details</span></td>
                </tr>
              );
            })}
            {sales.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
      {viewing && <CustomerDetailModal db={db} sale={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}


export function AdminProfileTab({ db, persist, addAudit, showToast }) {
  const admin = db.admin || { username: 'admin', password: 'admin123', name: 'Super Admin' };
  const [form, setForm] = useState({
    name: admin.name,
    username: admin.username,
    password: admin.password,
  });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const save = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    const newDb = {
      ...db,
      admin: {
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
      }
    };
    addAudit(newDb, 'Super Admin', 'Updated administrator profile name/credentials');
    persist(newDb);
    showToast('Administrator profile updated successfully');
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '20px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCircle2 size={18} color="#fff" />
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Administrator Profile Settings</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label>Display Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Super Admin" />
        </div>
        <div>
          <label>Login Username (ID)</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. admin" />
        </div>
        <div>
          <label>Login Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <span onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: 9, cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </span>
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</div>}

        <button className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} onClick={save}>
          Save Profile Changes
        </button>
      </div>
    </div>
  );
}
