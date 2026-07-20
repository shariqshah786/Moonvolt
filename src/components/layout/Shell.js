"use client";
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Package, Users, Truck, ShieldCheck, FileText, Search, ScrollText, Car, ClipboardList, UserCircle2, LogOut, Menu, Bell, AlertTriangle, Sun, Moon, Check } from 'lucide-react';
import { LOW_STOCK_THRESHOLD, ALL_MODELS } from '../../lib/constants';
import { daysUntil } from '../../lib/helpers';
import { AdminDashboard, InventoryTab, DistributorsTab, SupplyTab, WarrantyTab, ReportsTab, SearchTab, AuditTab } from '../admin/AdminTabs';
import { DistributorDashboard, MyInventoryTab, SellTab, SalesHistoryTab, ClaimsTab } from '../distributor/DistributorTabs';



export function Shell({ theme, setTheme, session, setSession, db, persist, addAudit, activeTab, setActiveTab, showToast, toast, sidebarOpen, setSidebarOpen }) {
  const isAdmin = session.role === 'admin';

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'distributors', label: 'Distributors', icon: Users },
    { id: 'supply', label: 'Supply Vehicles', icon: Truck },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'search', label: 'Global Search', icon: Search },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
  ];
  const distTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myinventory', label: 'My Inventory', icon: Package },
    { id: 'sell', label: 'Sell Vehicle', icon: Car },
    { id: 'saleshistory', label: 'Sales History', icon: ClipboardList },
    { id: 'claims', label: 'Warranty Claims', icon: ShieldCheck },
  ];
  const tabs = isAdmin ? adminTabs : distTabs;

  const notifications = useMemo(() => buildNotifications(db, session), [db, session]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 236, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)',
        position: sidebarOpen ? 'fixed' : 'relative', zIndex: 50, height: '100vh', display: sidebarOpen ? 'block' : undefined,
      }} className={sidebarOpen ? '' : 'hide-mobile-sidebar'}>
        <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid var(--border)' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Car size={16} color="#fff" />
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>MoonVolt VDMS</span>
        </div>
        <div style={{ padding: 12 }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <div key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                  marginBottom: 3, fontSize: 13, fontWeight: 600,
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  borderLeft: active ? '3px solid var(--accent2)' : '3px solid transparent',
                }}>
                <Icon size={16} />{t.label}
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <UserCircle2 size={22} color="var(--text-muted)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{isAdmin ? 'Super Admin' : 'Distributor'}</div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSession(null)}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          theme={theme} setTheme={setTheme} session={session} tabs={tabs} activeTab={activeTab}
          notifications={notifications} setSidebarOpen={setSidebarOpen}
        />
        <div style={{ padding: 20, flex: 1, minWidth: 0 }}>
          {activeTab === 'dashboard' && isAdmin && <AdminDashboard db={db} />}
          {activeTab === 'dashboard' && !isAdmin && <DistributorDashboard db={db} session={session} />}
          {activeTab === 'inventory' && <InventoryTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'distributors' && <DistributorsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'supply' && <SupplyTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'warranty' && <WarrantyTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} isAdmin={isAdmin} session={session} />}
          {activeTab === 'reports' && <ReportsTab db={db} />}
          {activeTab === 'search' && <SearchTab db={db} />}
          {activeTab === 'audit' && <AuditTab db={db} />}
          {activeTab === 'myinventory' && <MyInventoryTab db={db} session={session} />}
          {activeTab === 'sell' && <SellTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} />}
          {activeTab === 'saleshistory' && <SalesHistoryTab db={db} session={session} />}
          {activeTab === 'claims' && <ClaimsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} isAdmin={false} />}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100, padding: '12px 18px', borderRadius: 10,
          background: toast.kind === 'error' ? 'var(--danger)' : 'var(--surface)', border: '1px solid var(--border)',
          color: toast.kind === 'error' ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={15} /> {toast.msg}
        </div>
      )}
    </div>
  );
}

export function buildNotifications(db, session) {
  const notes = [];
  const isAdmin = session.role === 'admin';
  // low stock
  ALL_MODELS.forEach(({ cat, model }) => {
    const count = db.vehicles.filter(v => v.model === model && v.status === 'In Stock').length;
    if (isAdmin && count > 0 && count < LOW_STOCK_THRESHOLD) {
      notes.push({ type: 'warning', text: `Low stock: ${model} (${cat}) — only ${count} left in warehouse` });
    }
  });
  // warranty expiry within 30 days
  db.vehicles.forEach(v => {
    if (session.role === 'distributor' && v.distributorId !== session.distributorId) return;
    if (v.batteryWarranty && v.status !== 'Warranty Expired') {
      const dLeft = daysUntil(v.batteryWarranty.end);
      if (dLeft >= 0 && dLeft <= 30) notes.push({ type: 'danger', text: `Battery warranty for ${v.id} expires in ${dLeft} day(s)` });
    }
    if (v.chargerWarranty && v.status !== 'Warranty Expired') {
      const dLeft = daysUntil(v.chargerWarranty.end);
      if (dLeft >= 0 && dLeft <= 30) notes.push({ type: 'danger', text: `Charger warranty for ${v.id} expires in ${dLeft} day(s)` });
    }
  });
  // pending claims
  (db.claims || []).filter(c => c.status === 'Pending' && (isAdmin || c.distributorId === session.distributorId))
    .forEach(c => notes.push({ type: 'info', text: `Pending warranty claim on ${c.vehicleId}` }));
  return notes.slice(0, 20);
}

export function TopBar({ theme, setTheme, session, tabs, activeTab, notifications, setSidebarOpen }) {
  const [openNotif, setOpenNotif] = useState(false);
  const label = tabs.find(t => t.id === activeTab)?.label || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-sm hide-mobile-none" onClick={() => setSidebarOpen(s => !s)} style={{ display: 'none' }}><Menu size={15} /></button>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button className="btn btn-sm" onClick={() => setOpenNotif(o => !o)} style={{ position: 'relative' }}>
          <Bell size={14} />
          {notifications.length > 0 && (
            <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 5px', fontWeight: 700 }}>{notifications.length}</span>
          )}
        </button>
        {openNotif && (
          <div className="card" style={{ position: 'absolute', top: 40, right: 0, width: 320, maxHeight: 380, overflowY: 'auto', zIndex: 60, padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Notifications</div>
            {notifications.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You&apos;re all caught up.</div>}
            {notifications.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <AlertTriangle size={14} color={n.type === 'danger' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : 'var(--info)'} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, lineHeight: 1.5 }}>{n.text}</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-sm" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  );
}
