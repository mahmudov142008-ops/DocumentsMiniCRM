import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../lib/validation';
import { LogIn, UserPlus, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRegisteredSuccess(false);

    // Basic validation
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error, requiresEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error);
        } else if (requiresEmailConfirmation) {
          setRegisteredSuccess(true);
          toast.info('Account created! Please check your email to confirm registration.');
        } else {
          toast.success('Account created successfully! Logging you in...');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.5rem',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '16px',
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Mini CRM
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Minimalist customer relationship & sales pipeline management
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '32px 28px', boxShadow: 'var(--shadow-md)' }}>
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setRegisteredSuccess(false);
              }}
              style={{
                padding: '8px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '0.875rem',
                fontWeight: mode === 'login' ? 600 : 500,
                backgroundColor: mode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'login' ? 'var(--shadow-xs)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setRegisteredSuccess(false);
              }}
              style={{
                padding: '8px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '0.875rem',
                fontWeight: mode === 'register' ? 600 : 500,
                backgroundColor: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'register' ? 'var(--shadow-xs)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              Create Account
            </button>
          </div>

          {registeredSuccess && (
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--status-new-bg)',
                border: '1px solid var(--status-new-border)',
                color: 'var(--status-new-text)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Registration successful!</strong>
                <p style={{ marginTop: '4px', fontSize: '0.8125rem' }}>
                  Please confirm the email link sent to your inbox to activate your account.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--danger-subtle)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                fontSize: '0.875rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="auth-password" className="form-label">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px', fontSize: '0.9375rem' }}
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={16} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Security & RLS notice */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-tertiary)',
              fontSize: '0.75rem',
            }}
          >
            <Shield size={13} color="var(--primary)" />
            <span>Encrypted passwords & Row-Level Security isolation</span>
          </div>
        </div>

        {/* Features hint */}
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="var(--accent-violet)" />
            Real PostgreSQL backend with instant data persistence
          </span>
        </div>
      </div>
    </div>
  );
};
