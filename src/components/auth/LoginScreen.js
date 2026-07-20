"use client";
import React, { useState } from 'react';
import { Sun, Moon, Car, EyeOff, Eye } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../../lib/constants';
import { rootVars, globalCss } from '../../lib/theme';



export function LoginScreen({ theme, setTheme, db, onLogin }) {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = () => {
    setError('');
    if (role === 'admin') {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        onLogin({ role: 'admin', name: 'Super Admin' });
      } else {
        setError('Invalid admin credentials.');
      }
    } else {
      const dist = db.distributors.find(d => d.username === username);
      if (!dist) { setError('No distributor account found with that username.'); return; }
      if (dist.status === 'suspended') { setError('This distributor account has been suspended. Contact admin.'); return; }
      if (dist.password !== password) { setError('Incorrect password.'); return; }
      onLogin({ role: 'distributor', distributorId: dist.id, name: dist.shopName });
    }
  };

  return (
    <div style={{ ...rootVars(theme), minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{globalCss}</style>
      <button className="btn btn-sm" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        style={{ position: 'absolute', top: 20, right: 20 }}>
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent1), var(--accent2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={18} color="#fff" />
            </span>
            MoonVolt VDMS
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Vehicle Distribution Management System</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: 'var(--surface-2)', padding: 4, borderRadius: 10 }}>
            {['admin', 'distributor'].map(r => (
              <button key={r} onClick={() => { setRole(r); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: role === r ? 'linear-gradient(135deg, var(--accent1), var(--accent2))' : 'transparent',
                  color: role === r ? '#fff' : 'var(--text-muted)',
                }}>
                {r === 'admin' ? 'Super Admin' : 'Distributor'}
              </button>
            ))}
          </div>

          {!showOtp ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                  placeholder={role === 'admin' ? 'admin' : 'e.g. sunrise'} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                    placeholder="••••••••" />
                  <span onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: 9, cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 14 }}>
                <span onClick={() => setShowOtp(true)} style={{ fontSize: 12, color: 'var(--accent1)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <div className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 11 }} onClick={handleLogin}>Sign in</div>
              <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Demo credentials — Admin: <code style={{ fontFamily: 'var(--font-mono)' }}>admin / admin123</code><br />
                Distributor: <code style={{ fontFamily: 'var(--font-mono)' }}>sunrise / sunrise123</code>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>Enter the OTP sent to your registered mobile number to reset your password.</p>
              <div style={{ marginBottom: 12 }}>
                <label>OTP</label>
                <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="6-digit code" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setShowOtp(false); setError('OTP flow is a demo simulation — no SMS is actually sent.'); }}>
                Verify & continue
              </button>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span onClick={() => setShowOtp(false)} style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Back to login</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
