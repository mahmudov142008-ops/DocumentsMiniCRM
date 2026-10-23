import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../lib/validation';
import { LogIn, UserPlus, Shield, Sparkles, CheckCircle2, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onBackToLanding }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Back Link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-light)',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.375rem',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)',
              marginBottom: '14px',
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FFFFFF' }}>
            {mode === 'login' ? 'Sign in to MiniCRM' : 'Create your CRM workspace'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {mode === 'login'
              ? 'Enter your credentials to manage your pipeline'
              : 'Join to organize leads and close deals with clarity'}
          </p>
        </div>

        {/* Auth Glassmorphism Card */}
        <div
          className="card"
          style={{
            padding: '32px 28px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.8) 0%, rgba(12, 17, 28, 0.95) 100%)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: 'rgba(8, 11, 17, 0.8)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
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
                padding: '9px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: mode === 'login' ? 600 : 500,
                backgroundColor: mode === 'login' ? 'var(--primary-subtle)' : 'transparent',
                color: mode === 'login' ? '#FFFFFF' : 'var(--text-secondary)',
                border: mode === 'login' ? '1px solid var(--primary-border)' : '1px solid transparent',
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
                padding: '9px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: mode === 'register' ? 600 : 500,
                backgroundColor: mode === 'register' ? 'var(--primary-subtle)' : 'transparent',
                color: mode === 'register' ? '#FFFFFF' : 'var(--text-secondary)',
                border: mode === 'register' ? '1px solid var(--primary-border)' : '1px solid transparent',
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
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
                borderRadius: '10px',
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
                <p style={{ marginTop: '4px', fontSize: '0.8125rem', color: '#A7F3D0' }}>
                  Please confirm the email link sent to your inbox to activate your account.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                borderRadius: '10px',
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
                  <span>Full Name</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">
                <span>Email Address</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="auth-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="auth-password" className="form-label">
                <span>Password</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>≥ 6 characters</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="auth-password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9375rem',
                borderRadius: '10px',
                fontWeight: 600,
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
              }}
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
            <Shield size={13} color="var(--accent-blue)" />
            <span>Encrypted passwords & PostgreSQL Row-Level Security</span>
          </div>
        </div>

        {/* Feature badge footer */}
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="var(--accent-violet)" />
            Multi-tenant data isolation enabled
          </span>
        </div>
      </div>
    </div>
  );
};
