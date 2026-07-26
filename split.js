const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'VehicleDistributionSystem (8).jsx');
const src = fs.readFileSync(srcFile, 'utf-8');

const sections = src.split(/\/\* ============================== (.+?) ============================== \*\//g);

const map = {};
for (let i = 1; i < sections.length; i += 2) {
  map[sections[i].trim()] = sections[i + 1];
}

const mkdir = (dir) => fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
mkdir('src/lib');
mkdir('src/components/ui');
mkdir('src/components/layout');
mkdir('src/components/auth');
mkdir('src/components/admin');
mkdir('src/components/distributor');

const write = (file, content) => fs.writeFileSync(path.join(__dirname, file), content.trim() + '\n');

// 1. CONSTANTS
let constantsCode = map['CONSTANTS'];
constantsCode = constantsCode.replace(/^const /gm, 'export const ');
write('src/lib/constants.js', constantsCode);

// 2. HELPERS
let helpersCode = map['HELPERS'];
helpersCode = "import * as XLSX from 'xlsx';\n\n" + helpersCode.replace(/^const /gm, 'export const ');
write('src/lib/helpers.js', helpersCode);

// 3. SEED DATA
let seedCode = map['SEED DATA'];
seedCode = `
import { ALL_MODELS, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS } from './constants';
import { uid, genVehicleId, genInvoice, addMonths, todayStr } from './helpers';

export ${seedCode.trim()}
`;
write('src/lib/seed.js', seedCode);

// 4. UI PIECES
let uiCode = map['SMALL UI PIECES'];
uiCode = `
"use client";
import React from 'react';
import { STATUS_COLORS } from '../../lib/constants';
import { X } from 'lucide-react';

${uiCode.replace(/function/g, 'export function').replace(/const grid/g, 'export const grid')}
`;
write('src/components/ui/SharedUI.js', uiCode);

// 5. LOGIN
let loginCode = map['LOGIN'];
loginCode = loginCode.replace(
  /username === ADMIN_CREDENTIALS\.username && password === ADMIN_CREDENTIALS\.password/g,
  `username === (db?.admin?.username || ADMIN_CREDENTIALS.username) && password === (db?.admin?.password || ADMIN_CREDENTIALS.password)`
).replace(
  /onLogin\(\{ role: 'admin', name: 'Super Admin' \}\)/g,
  `onLogin({ role: 'admin', name: db?.admin?.name || 'Super Admin' })`
);
loginCode = `
"use client";
import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Users, Truck, ShieldCheck, FileText, Search,
  Bell, Sun, Moon, LogOut, Plus, Edit2, Trash2, X, Check, AlertTriangle,
  ChevronDown, Download, Menu, Car, TrendingUp, ClipboardList, UserCircle2,
  ScrollText, Filter, Eye, EyeOff, RefreshCw, IndianRupee, MapPin, Megaphone,
  Landmark, Sparkles, Wallet, BadgeCheck, HandCoins, CalendarClock, Percent,
  MessageSquare, History, ExternalLink, FileCheck2, BatteryFull, Paperclip, Wrench
} from 'lucide-react';
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD, BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS, STORAGE_KEY, PAYMENT_MODES, ANNOUNCEMENT_TYPES, SMS_TYPES, ADMIN_CREDENTIALS } from '../../lib/constants';
import { rootVars, globalCss } from '../../lib/theme';

${loginCode.replace(/function LoginScreen/, 'export function LoginScreen')}
`;
write('src/components/auth/LoginScreen.js', loginCode);

// 6. ADMIN TABS (Combine all admin sections)
let adminCode = `
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
import { uid, pad4, genVehicleId, genInvoice, fmtDate, todayStr, addMonths, daysUntil, inr, csvDownload, excelDownload, printReport } from '../../lib/helpers';
import { StatCard, StatusBadge, Modal, grid2, grid3 } from '../ui/SharedUI';

${map['ADMIN DASHBOARD'].replace(/^function /gm, 'export function ')}
${map['INVENTORY TAB'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTORS TAB'].replace(/^function /gm, 'export function ')}
${map['SUPPLY TAB'].replace(/^function /gm, 'export function ')}
${map['WARRANTY TAB (Admin)'].replace(/^function /gm, 'export function ')}
${map['REPORTS TAB'].replace(/^function /gm, 'export function ')}
${map['SEARCH TAB'].replace(/^function /gm, 'export function ')}
${map['AUDIT TAB'].replace(/^function /gm, 'export function ')}
${map['FINANCE HELPERS'].replace(/^function /gm, 'export function ')}
${map['ADMIN: FINANCE & LOANS'].replace(/^function /gm, 'export function ')}
${map['ADMIN: COLLECTION MANAGEMENT MODAL'].replace(/^function /gm, 'export function ')}
${map['ADMIN: SALES LOCATIONS'].replace(/^function /gm, 'export function ')}
${map['ANNOUNCEMENTS'].replace(/^function /gm, 'export function ')}
${map['SHARED: CUSTOMER DETAIL MODAL'].replace(/^function /gm, 'export function ')}
${map['ADMIN: SALES & CUSTOMERS'].replace(/^function /gm, 'export function ')}

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
`;
write('src/components/admin/AdminTabs.js', adminCode);

// 7. DISTRIBUTOR TABS (Combine all distributor sections)
let distCode = `
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

${map['DISTRIBUTOR DASHBOARD'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: MY INVENTORY'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: SELL VEHICLE'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: SALES HISTORY'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: WARRANTY CLAIMS'].replace(/^function /gm, 'export function ')}
${map['FINANCE HELPERS'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: MY FINANCE'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: WARRANTY CHECKER'].replace(/^function /gm, 'export function ')}
${map['DISTRIBUTOR: OLD TRANSACTIONS'].replace(/^function /gm, 'export function ')}
${map['SHARED: CUSTOMER DETAIL MODAL'].replace(/^function /gm, 'export function ')}

export function DistributorProfileTab({ db, persist, addAudit, showToast, session }) {
  const distId = session.distributorId;
  const dist = db.distributors.find(d => d.id === distId);
  const [form, setForm] = useState({
    ownerName: dist?.ownerName || '',
    mobile: dist?.mobile || '',
    address: dist?.address || '',
    email: dist?.email || '',
    username: dist?.username || '',
    password: dist?.password || '',
  });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const save = () => {
    if (!form.ownerName.trim() || !form.mobile.trim() || !form.address.trim() || !form.email.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const dup = db.distributors.find(d => d.username === form.username.trim() && d.id !== distId);
    if (dup || form.username.trim() === 'admin') {
      setError('Username is already taken.');
      return;
    }

    setError('');
    const newDb = {
      ...db,
      distributors: db.distributors.map(d => d.id === distId ? {
        ...d,
        ownerName: form.ownerName.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
      } : d)
    };
    addAudit(newDb, dist?.shopName || distId, 'Updated distributor profile settings & credentials');
    persist(newDb);
    showToast('Profile updated successfully');
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '20px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCircle2 size={18} color="#fff" />
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>My Profile Settings</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label>Shop Name (Read-only)</label>
          <input value={dist?.shopName || ''} disabled style={{ opacity: 0.7, background: 'var(--surface-hover)' }} />
        </div>
        <div>
          <label>GST Number (Read-only)</label>
          <input value={dist?.gst || ''} disabled style={{ opacity: 0.7, background: 'var(--surface-hover)', fontFamily: 'var(--font-mono)' }} />
        </div>
        <div style={grid2}>
          <div>
            <label>Owner Name</label>
            <input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner Name" />
          </div>
          <div>
            <label>Mobile Number</label>
            <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile" />
          </div>
        </div>
        <div>
          <label>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        </div>
        <div>
          <label>Address</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" />
        </div>
        <div style={grid2}>
          <div>
            <label>Login Username</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" />
          </div>
          <div>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" />
              <span onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: 9, cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
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
`;
write('src/components/distributor/DistributorTabs.js', distCode);

// 8. SHELL (Layout)
let shellCode = map['SHELL (Layout)'];
shellCode = shellCode.replace(
  /const adminTabs = \[([\s\S]+?)\];/m,
  (match, p1) => {
    const cleanP1 = p1.trim();
    const sep = cleanP1.endsWith(',') ? '' : ',';
    return `const adminTabs = [\n    ${cleanP1}${sep}\n    { id: 'profile', label: 'Admin Profile', icon: UserCircle2 }\n  ];`;
  }
).replace(
  /const distTabs = \[([\s\S]+?)\];/m,
  (match, p1) => {
    const cleanP1 = p1.trim();
    const sep = cleanP1.endsWith(',') ? '' : ',';
    return `const distTabs = [\n    ${cleanP1}${sep}\n    { id: 'profile', label: 'My Profile', icon: UserCircle2 }\n  ];`;
  }
).replace(
  /\{activeTab === 'audit' && <AuditTab db=\{db\} \/>\}/g,
  `{activeTab === 'audit' && <AuditTab db={db} />}\n          {activeTab === 'profile' && isAdmin && <AdminProfileTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} />}`
).replace(
  /\{activeTab === 'claims' && <ClaimsTab db=\{db\} persist=\{persist\} addAudit=\{addAudit\} showToast=\{showToast\} session=\{session\} isAdmin=\{false\} \/>\}/g,
  `{activeTab === 'claims' && <ClaimsTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} isAdmin={false} />}\n          {activeTab === 'profile' && !isAdmin && <DistributorProfileTab db={db} persist={persist} addAudit={addAudit} showToast={showToast} session={session} />}`
);
shellCode = `
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

${shellCode.replace(/function Shell/, 'export function Shell').replace(/function TopBar/, 'export function TopBar').replace(/function buildNotifications/, 'export function buildNotifications')}
`;
write('src/components/layout/Shell.js', shellCode);

// 9. APP ROOT (page.js)
let appCode = map['APP ROOT'];
appCode = appCode.replace(/function rootVars[\s\S]+$/, ''); // strip duplicate local rootVars & globalCss

const mongoEffect = `useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/db');
        if (!res.ok) throw new Error('Failed to fetch DB');
        const data = await res.json();
        setDb(data);
        setLoading(false);
      } catch (e) {
        console.error('MongoDB load failed, falling back to local seed:', e);
        setDb(seedDB());
        setLoading(false);
      }
    })();
  }, []);`;

const mongoPersist = `const persist = useCallback(async (newDb) => {
    setDb(newDb);
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb),
      });
    } catch (e) {
      console.error('Failed to save to MongoDB:', e);
    }
  }, []);`;

appCode = appCode.replace(/useEffect\(\(\) => \{[\s\S]+?\}\[, \]\);/m, mongoEffect);
appCode = appCode.replace(/const persist = useCallback\([\s\S]+?\}\[, \]\);/m, mongoPersist);

appCode = `
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { seedDB } from '../lib/seed';
import { LoginScreen } from '../components/auth/LoginScreen';
import { Shell } from '../components/layout/Shell';
import { rootVars, globalCss } from '../lib/theme';
import { uid } from '../lib/helpers';

${appCode}
`;
write('src/app/page.js', appCode);

console.log("Refactoring complete.");
