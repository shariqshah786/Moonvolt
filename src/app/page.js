"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Car, Sparkles, ShieldCheck } from 'lucide-react';
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
        if (isInitial) {
          setTimeout(() => setLoading(false), 800); // smooth splash loader display
        }
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
        setTimeout(() => setLoading(false), 800);
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
      <div style={{
        ...rootVars(theme), minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden', padding: 20
      }}>
        <style>{globalCss}</style>
        {/* Glow ambient background aura */}
        <div style={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent2) 0%, rgba(0,0,0,0) 70%)',
          opacity: 0.22, filter: 'blur(60px)', pointerEvents: 'none', animation: 'pulseGlow 3s ease-in-out infinite alternate'
        }} />

        <div style={{ textAlign: 'center', zIndex: 10, maxWidth: 360, width: '100%' }}>
          {/* Animated EV Emblem */}
          <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: -8, borderRadius: 24,
              background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', opacity: 0.45, filter: 'blur(12px)',
              animation: 'pulseGlow 2s infinite alternate'
            }} />
            <div style={{
              width: 76, height: 76, borderRadius: 22,
              background: 'linear-gradient(135deg, var(--accent1), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 30px var(--accent-glow)', position: 'relative'
            }}>
              <Car size={38} color="#ffffff" style={{ animation: 'floatLogo 2.5s ease-in-out infinite alternate' }} />
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--text)' }}>
            MoonVolt VDMS
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, marginBottom: 28 }}>
            Vehicle Distribution Management System
          </div>

          {/* Glowing Animated Loading Track */}
          <div style={{
            width: '100%', height: 6, borderRadius: 10, background: 'var(--surface-2)',
            overflow: 'hidden', position: 'relative', border: '1px solid var(--border)'
          }}>
            <div style={{
              height: '100%', width: '100%', borderRadius: 10,
              background: 'linear-gradient(90deg, var(--accent1), var(--accent2), var(--info))',
              animation: 'loadingProgress 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, color: 'var(--text-dim)', fontSize: 12, fontWeight: 600 }}>
            <Sparkles size={14} color="var(--accent2)" className="pulse-icon" />
            <span>Connecting to Real-time MongoDB Engine…</span>
          </div>
        </div>
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

