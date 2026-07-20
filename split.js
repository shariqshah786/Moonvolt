const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'VehicleDistributionSystem.jsx');
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
constantsCode = constantsCode.replace(/const /g, 'export const ');
write('src/lib/constants.js', constantsCode);

// 2. HELPERS
let helpersCode = map['HELPERS'];
helpersCode = "import * as XLSX from 'xlsx';\n\n" + helpersCode.replace(/const /g, 'export const ');
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
loginCode = `
"use client";
import React, { useState } from 'react';
import { Sun, Moon, Car, EyeOff, Eye } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../../lib/constants';

${loginCode.replace(/function LoginScreen/, 'export function LoginScreen')}
`;
write('src/components/auth/LoginScreen.js', loginCode);

// 6. ADMIN TABS (Combine all admin sections)
let adminCode = `
"use client";
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Package, TrendingUp, Truck, AlertTriangle, ShieldCheck, Plus, Edit2, Trash2, Download, FileText, Search, Car } from 'lucide-react';
import { CATEGORIES, ALL_MODELS, STATUSES, STATUS_COLORS, LOW_STOCK_THRESHOLD } from '../../lib/constants';
import { genVehicleId, todayStr, fmtDate, uid, inr, csvDownload, excelDownload, printReport, daysUntil, addMonths } from '../../lib/helpers';
import { StatCard, StatusBadge, Modal, grid2, grid3 } from '../ui/SharedUI';

${map['ADMIN DASHBOARD'].replace(/function/g, 'export function')}
${map['INVENTORY TAB'].replace(/function/g, 'export function')}
${map['DISTRIBUTORS TAB'].replace(/function/g, 'export function')}
${map['SUPPLY TAB'].replace(/function/g, 'export function')}
${map['WARRANTY TAB (Admin)'].replace(/function/g, 'export function')}
${map['REPORTS TAB'].replace(/function/g, 'export function')}
${map['SEARCH TAB'].replace(/function/g, 'export function')}
${map['AUDIT TAB'].replace(/function/g, 'export function')}
`;
write('src/components/admin/AdminTabs.js', adminCode);

// 7. DISTRIBUTOR TABS (Combine all distributor sections)
let distCode = `
"use client";
import React, { useState, useMemo } from 'react';
import { Package, TrendingUp, Car, ClipboardList, ShieldCheck, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BATTERY_WARRANTY_MONTHS, CHARGER_WARRANTY_MONTHS } from '../../lib/constants';
import { todayStr, genInvoice, addMonths, uid, inr, fmtDate, csvDownload, excelDownload } from '../../lib/helpers';
import { StatCard, StatusBadge, grid2, grid3 } from '../ui/SharedUI';

${map['DISTRIBUTOR DASHBOARD'].replace(/function/g, 'export function')}
${map['DISTRIBUTOR: MY INVENTORY'].replace(/function/g, 'export function')}
${map['DISTRIBUTOR: SELL VEHICLE'].replace(/function/g, 'export function')}
${map['DISTRIBUTOR: SALES HISTORY'].replace(/function/g, 'export function')}
${map['DISTRIBUTOR: WARRANTY CLAIMS'].replace(/function/g, 'export function')}
`;
write('src/components/distributor/DistributorTabs.js', distCode);

// 8. SHELL (Layout)
let shellCode = map['SHELL (Layout)'];
shellCode = `
"use client";
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Package, Users, Truck, ShieldCheck, FileText, Search, ScrollText, Car, ClipboardList, UserCircle2, LogOut, Menu, Bell, AlertTriangle, Sun, Moon, Check } from 'lucide-react';
import { LOW_STOCK_THRESHOLD, ALL_MODELS } from '../../lib/constants';
import { daysUntil } from '../../lib/helpers';
import { AdminDashboard, InventoryTab, DistributorsTab, SupplyTab, WarrantyTab, ReportsTab, SearchTab, AuditTab } from '../admin/AdminTabs';
import { DistributorDashboard, MyInventoryTab, SellTab, SalesHistoryTab, ClaimsTab } from '../distributor/DistributorTabs';

${shellCode.replace(/function Shell/, 'export function Shell').replace(/function TopBar/, 'export function TopBar').replace(/function buildNotifications/, 'export function buildNotifications')}
`;
write('src/components/layout/Shell.js', shellCode);

// 9. APP ROOT (page.js)
let appCode = map['APP ROOT'];
appCode = `
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { seedDB } from '../lib/seed';
import { LoginScreen } from '../components/auth/LoginScreen';
import { Shell } from '../components/layout/Shell';

${appCode}
`;
write('src/app/page.js', appCode);

console.log("Refactoring complete.");
