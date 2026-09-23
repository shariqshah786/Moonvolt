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
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS, STORAGE_KEY, PAYMENT_MODES, ANNOUNCEMENT_TYPES, SMS_TYPES, ADMIN_CREDENTIALS } from '../../lib/constants';
import { uid, pad4, genVehicleId, genInvoice, fmtDate, todayStr, addMonths, daysUntil, inr, csvDownload, excelDownload, printReport } from '../../lib/helpers';
import { 
  AdminDashboard, InventoryTab, DistributorsTab, SupplyTab, WarrantyTab, ReportsTab, SearchTab, AuditTab,
  FinanceTab, SalesLocationsTab, AnnouncementsTab, AdminSalesTab, AdminProfileTab 
} from '../admin/AdminTabs';
import { 
  DistributorDashboard, MyInventoryTab, SellTab, SalesHistoryTab, ClaimsTab,
  DistributorFinanceTab, DistributorWarrantyCheckTab, TransactionHistoryTab, DistributorProfileTab 
} from '../distributor/DistributorTabs';



export function Shell({ theme, setTheme, session, setSession, db, persist, addAudit, activeTab, setActiveTab, showToast, toast, sidebarOpen, setSidebarOpen }) {
  const isAdmin = session.role === 'admin';

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'distributors', label: 'Distributors', icon: Users },
    { id: 'supply', label: 'Supply Vehicles', icon: Truck },
    { id: 'finance', label: 'Finance & Loans', icon: IndianRupee },
    { id: 'sales', label: 'Sales & Customers', icon: ClipboardList },
    { id: 'saleslocations', label: 'Sales Locations', icon: MapPin },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'search', label: 'Global Search', icon: Search },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle2 }
  ];
  const distTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myinventory', label: 'My Inventory', icon: Package },
    { id: 'sell', label: 'Sell Vehicle', icon: Car },
    { id: 'saleshistory', label: 'Sales History', icon: ClipboardList },
    { id: 'oldtransactions', label: 'Old Transactions', icon: History },
    { id: 'finance', label: 'My Finance', icon: IndianRupee },
    { id: 'warrantycheck', label: 'Warranty Checker', icon: BadgeCheck },
    { id: 'claims', label: 'Warranty Claims', icon: ShieldCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: UserCircle2 }
  ];
  const tabs = isAdmin ? adminTabs : distTabs;

  const notifications = useMemo(() => buildNotifications(db, session), [db, session]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 248, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)',
        position: sidebarOpen ? 'fixed' : 'sticky', left: 0, top: 0, zIndex: 100, height: '100vh',
        display: 'flex', flexDirection: 'column', transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }} className={sidebarOpen ? '' : 'hide-mobile-sidebar'}>
        <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px var(--accent-glow)' }}>
              <Car size={18} color="#fff" />
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>MoonVolt VDMS</span>
          </div>
          <button className="btn btn-sm mobile-menu-btn" onClick={() => setSidebarOpen(false)} style={{ padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <div key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  marginBottom: 4, fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'linear-gradient(135deg, var(--accent1), var(--accent2))' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
                  transition: 'all 0.15s ease',
                }}>
                <Icon size={16} color={active ? '#ffffff' : 'var(--text-muted)'} />
                <span>{t.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--surface-2)', flexShrink: 0, margin: 10, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCircle2 size={20} color="var(--accent2)" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{isAdmin ? 'Super Admin' : 'Distributor'}</div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSession(null)}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          theme={theme} setTheme={setTheme} session={session} tabs={tabs} activeTab={activeTab}
          notifications={notifications} setSidebarOpen={setSidebarOpen}
        />
        <div style={{ padding: 20, flex: 1, minWidth: 0 }} className="main-content-padding">
          {activeTab === 'dashboard' && isAdmin && <AdminDashboard db={db} />}
          {activeTab === 'dashboard' && !isAdmin && <DistributorDashboard db={db} session={session} />}
          {activeTab === 'inventory' && <InventoryTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'distributors' && <DistributorsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'supply' && <SupplyTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'finance' && isAdmin && <FinanceTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'finance' && !isAdmin && <DistributorFinanceTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} />}
          {activeTab === 'sales' && <AdminSalesTab db={db} />}
          {activeTab === 'saleslocations' && <SalesLocationsTab db={db} />}
          {activeTab === 'warranty' && <WarrantyTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} isAdmin={isAdmin} session={session} />}
          {activeTab === 'announcements' && <AnnouncementsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} isAdmin={isAdmin} session={session} />}
          {activeTab === 'reports' && <ReportsTab db={db} />}
          {activeTab === 'search' && <SearchTab db={db} />}
          {activeTab === 'audit' && <AuditTab db={db} />}
          {activeTab === 'profile' && isAdmin && <AdminProfileTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} setSession={setSession} />}
          {activeTab === 'myinventory' && <MyInventoryTab db={db} session={session} />}
          {activeTab === 'sell' && <SellTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} />}
          {activeTab === 'saleshistory' && <SalesHistoryTab db={db} session={session} />}
          {activeTab === 'oldtransactions' && <TransactionHistoryTab db={db} session={session} />}
          {activeTab === 'warrantycheck' && <DistributorWarrantyCheckTab db={db} session={session} />}
          {activeTab === 'claims' && <ClaimsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} isAdmin={false} />}
          {activeTab === 'profile' && !isAdmin && <DistributorProfileTab db={db} session={session} />}
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
  // overdue credit / loan balances
  (db.transactions || []).filter(t => t.paymentType === 'Credit' && (isAdmin || t.distributorId === session.distributorId)).forEach(t => {
    const paid = (db.payments || []).filter(p => p.transactionId === t.id).reduce((s, p) => s + p.amount, 0);
    const interest = Math.round((t.totalAmount || 0) * (t.interestRate || 0) / 100);
    const payable = (t.totalAmount || 0) + interest;
    const balance = payable - paid;
    if (balance > 0 && t.dueDate && daysUntil(t.dueDate) < 0) {
      const distName = db.distributors.find(d => d.id === t.distributorId)?.shopName || t.distributorId;
      notes.push({ type: 'danger', text: `${isAdmin ? distName + ' has an' : 'You have an'} overdue credit balance of ${inr(balance)} on invoice ${t.invoiceNumber}` });
    }
  });
  // recent announcements
  (db.announcements || []).filter(a => daysUntil(a.createdDate) >= -14).forEach(a => {
    notes.push({ type: 'info', text: `${a.type}: ${a.title}` });
  });
  return notes.slice(0, 20);
}

export function TopBar({ theme, setTheme, session, tabs, activeTab, notifications, setSidebarOpen }) {
  const [openNotif, setOpenNotif] = useState(false);
  const label = tabs.find(t => t.id === activeTab)?.label || '';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px',
      borderBottom: '1px solid var(--border)', background: 'var(--surface)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-sm mobile-menu-btn" onClick={() => setSidebarOpen(s => !s)} style={{ padding: '6px 8px' }}>
          <Menu size={16} />
        </button>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button className="btn btn-sm" onClick={() => setOpenNotif(o => !o)} style={{ position: 'relative', padding: '6px 10px' }}>
          <Bell size={15} />
          {notifications.length > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: '#fff', borderRadius: 10, fontSize: 9, padding: '2px 5px', fontWeight: 800 }}>{notifications.length}</span>
          )}
        </button>
        {openNotif && (
          <div className="card" style={{ position: 'absolute', top: 42, right: 0, width: 320, maxHeight: 380, overflowY: 'auto', zIndex: 60, padding: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Notifications</span>
              <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{notifications.length}</span>
            </div>
            {notifications.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px 0' }}>You're all caught up.</div>}
            {notifications.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <AlertTriangle size={14} color={n.type === 'danger' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : 'var(--info)'} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, lineHeight: 1.5 }}>{n.text}</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-sm" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ padding: '6px 10px' }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </div>
  );
}

