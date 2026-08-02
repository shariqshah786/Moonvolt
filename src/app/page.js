"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { seedDB } from '../lib/seed';
import { LoginScreen } from '../components/auth/LoginScreen';
import { Shell } from '../components/layout/Shell';
import { rootVars, globalCss } from '../lib/theme';
import { uid } from '../lib/helpers';



export default function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [session, setSession] = useState(null); // { role: 'admin'|'distributor', distributorId? , name }
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSavingRef = useRef(false);

  // Load database from Real-Time MongoDB API endpoint
  const loadDbFromApi = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/db', { cache: 'no-store' });
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      if (data && !data.error) {
        if (!isSavingRef.current) {
          setDb(data);
          try { localStorage.setItem('vdms_local_cache', JSON.stringify(data)); } catch (_) {}
        }
        if (isInitial) setLoading(false);
        return true;
      }
      throw new Error(data.error || 'Invalid DB format');
    } catch (e) {
      console.warn('MongoDB sync failed, using fallback cache:', e);
      if (isInitial) {
        let local = null;
        try {
          const cached = localStorage.getItem('vdms_local_cache');
          if (cached) local = JSON.parse(cached);
        } catch (_) {}
        setDb(local || seedDB());
        setLoading(false);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    loadDbFromApi(true);

    // Real-Time database sync polling (every 3 seconds)
    const interval = setInterval(() => {
      loadDbFromApi(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadDbFromApi]);

  const persist = useCallback(async (newDb) => {
    setDb(newDb);
    try { localStorage.setItem('vdms_local_cache', JSON.stringify(newDb)); } catch (_) {}

    isSavingRef.current = true;
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb),
      });
    } catch (err) {
      console.error('Failed to persist state to MongoDB:', err);
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 1000);
    }
  }, []);

  const showToast = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const addAudit = useCallback((dbState, user, action) => {
    dbState.auditLog = [{ id: uid('LOG'), timestamp: new Date().toISOString(), user, action }, ...(dbState.auditLog || [])];
    return dbState;
  }, []);

  if (loading) {
    return (
      <div style={{ ...rootVars(theme), minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
        <style>{globalCss}</style>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Connecting to Real-time Database…</div>
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

