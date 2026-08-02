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
        width: 236, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)',
        position: sidebarOpen ? 'fixed' : 'relative', left: sidebarOpen ? 0 : undefined, top: sidebarOpen ? 0 : undefined, zIndex: 50, height: '100vh', display: sidebarOpen ? 'block' : undefined,
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
          {activeTab === 'finance' && isAdmin && <FinanceTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}
          {activeTab === 'finance' && !isAdmin && <DistributorFinanceTab db={db} session={session} />}
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-sm mobile-menu-btn" onClick={() => setSidebarOpen(s => !s)}><Menu size={15} /></button>
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
            {notifications.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You're all caught up.</div>}
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
