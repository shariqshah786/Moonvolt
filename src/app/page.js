"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { seedDB } from '../lib/seed';
import { LoginScreen } from '../components/auth/LoginScreen';
import { Shell } from '../components/layout/Shell';
import { uid } from '../lib/helpers';
import { rootVars, globalCss } from '../lib/theme';


export default function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [session, setSession] = useState(null); // { role: 'admin'|'distributor', distributorId? , name }
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let settled = false;
    const finish = (data) => {
      if (settled) return;
      settled = true;
      setDb(data);
      setLoading(false);
    };

    // Safety net: never let a hung or unavailable storage call block the app.
    // If storage doesn't respond within 4s, fall back to a fresh in-memory seed.
    const timeout = setTimeout(() => {
      if (!settled) finish(seedDB());
    }, 4000);

    (async () => {
      try {
        if (!window.storage || typeof window.storage.get !== 'function') {
          throw new Error('storage unavailable');
        }
        const res = await window.storage.get('vdms', true);
        if (res && res.value) {
          finish(JSON.parse(res.value));
        } else {
          const seeded = seedDB();
          finish(seeded);
          try { await window.storage.set('vdms', JSON.stringify(seeded), true); } catch (_) {}
        }
      } catch (e) {
        const seeded = seedDB();
        finish(seeded);
        try { await window.storage.set('vdms', JSON.stringify(seeded), true); } catch (_) {}
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => clearTimeout(timeout);
  }, []);

  const persist = useCallback(async (newDb) => {
    setDb(newDb);
    try { await window.storage.set('vdms', JSON.stringify(newDb), true); } catch (_) {}
  }, []);

  const showToast = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const addAudit = useCallback((dbState, user, action) => {
    dbState.auditLog = [{ id: uid('LOG'), timestamp: new Date().toISOString(), user, action }, ...dbState.auditLog];
    return dbState;
  }, []);

  if (loading) {
    return (
      <div style={{ ...rootVars(theme), minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
        <style>{globalCss}</style>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Vehicle Distribution System…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        theme={theme} setTheme={setTheme} db={db}
        onLogin={(sess) => { setSession(sess); setActiveTab('dashboard'); }}
      />
    );
  }

  return (
    <div style={rootVars(theme)}>
      <style>{globalCss}</style>
      <Shell
        theme={theme} setTheme={setTheme}
        session={session} setSession={setSession}
        db={db} persist={persist} addAudit={addAudit}
        activeTab={activeTab} setActiveTab={setActiveTab}
        showToast={showToast} toast={toast}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
}

