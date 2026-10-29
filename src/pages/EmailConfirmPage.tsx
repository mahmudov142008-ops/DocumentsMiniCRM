import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailConfirmPageProps {
  tokenHash: string;
  type: string;
  onSuccess: () => void;
}

/**
 * EmailConfirmPage — shown when the user clicks the confirmation link in their email.
 *
 * The Supabase email template links to:
 *   https://documents-mini-crm.vercel.app/?token_hash={{ .TokenHash }}&type=signup&next=confirm
 *
 * This page reads token_hash and type from the URL query string, presents a
 * "Confirm & Continue" button, and calls supabase.auth.verifyOtp() only when
 * the user clicks that button — preventing any race with the Supabase client's
 * own PKCE handler.
 *
 * On success, `onSuccess` is called, which navigates to the Dashboard.
 */
export const EmailConfirmPage: React.FC<EmailConfirmPageProps> = ({
  tokenHash,
  type,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated (e.g. the Supabase client handled it automatically),
  // call onSuccess immediately on mount.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        onSuccess();
      }
    });
  }, [onSuccess]);

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'signup' | 'email' | 'recovery',
      });

      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }

      if (!data?.session) {
        setStatus('error');
        setErrorMsg('Verification succeeded but no session was returned. Please try signing in.');
        return;
      }

      setStatus('success');
      // Small delay so the success state is briefly visible, then navigate
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
      {/* Background warm atmosphere */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(180, 154, 105, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand mark */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              border: '1px solid rgba(180, 154, 105, 0.35)',
              boxShadow: '0 2px 8px rgba(36, 57, 47, 0.12)',
              marginBottom: '14px',
            }}
          >
            M
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Confirm your email
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Click below to verify your email address and continue to MiniCRM.
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{
            padding: '32px 28px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Icon area */}
          {status === 'success' ? (
            <CheckCircle2
              size={48}
              color="var(--primary)"
              style={{ opacity: 0.9 }}
            />
          ) : status === 'error' ? (
            <AlertTriangle
              size={48}
              color="#EF4444"
              style={{ opacity: 0.85 }}
            />
          ) : (
            <Mail
              size={48}
              color="var(--accent-brass)"
              style={{ opacity: 0.85 }}
            />
          )}

          {/* Status message */}
          {status === 'success' && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Email confirmed! Redirecting to your dashboard…
            </p>
          )}

          {status === 'error' && errorMsg && (
            <div
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.10)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                color: '#FCA5A5',
                borderRadius: '10px',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              <strong>Confirmation failed:</strong>
              <br />
              {errorMsg}
              <br />
              <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
                The link may have expired. Please register again or request a new confirmation email.
              </span>
            </div>
          )}

          {/* Confirm button — only shown when not yet successful */}
          {status !== 'success' && (
            <button
              onClick={handleConfirm}
              disabled={status === 'loading'}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9375rem',
                borderRadius: '8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm &amp; Continue
                </>
              )}
            </button>
          )}

          {/* Back to sign in link */}
          {status === 'error' && (
            <button
              onClick={() => {
                window.history.replaceState(null, '', window.location.pathname);
                window.location.hash = '#login';
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>

      {/* Keyframe for spinner — injected inline for self-containment */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

