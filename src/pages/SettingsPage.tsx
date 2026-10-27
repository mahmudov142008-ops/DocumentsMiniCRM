import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePreferences, DateFormatOption } from '../context/PreferencesContext';
import { profileService } from '../services/profileService';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  LayoutGrid,
  Calendar,
  User as UserIcon,
  Save,
  Check,
  Lock,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    theme,
    resolvedTheme,
    accent,
    compactMode,
    dateFormat,
    setTheme,
    setAccent,
    setCompactMode,
    setDateFormat,
    formatDate,
  } = usePreferences();

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileCreatedAt, setProfileCreatedAt] = useState<string | null>(null);

  // Load existing profile from public.profiles
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoadingProfile(true);

    profileService.getProfile(user.id).then((profile) => {
      if (!isMounted) return;
      if (profile) {
        setFullName(profile.full_name || '');
        setProfileCreatedAt(profile.created_at);
      } else {
        // Fallback to auth metadata if profile row hasn't synced
        setFullName((user.user_metadata?.full_name as string) || '');
        setProfileCreatedAt(user.created_at || null);
      }
      setLoadingProfile(false);
    }).catch((err) => {
      console.error('Failed to load profile:', err);
      if (isMounted) setLoadingProfile(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error('Full name cannot be empty or only spaces.');
      return;
    }

    try {
      setSavingProfile(true);
      await profileService.updateProfile(user.id, fullName.trim());
      toast.success('Profile updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const todayIso = new Date().toISOString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Customize your workspace appearance, user profile, and system preferences.
        </p>
      </div>

      {/* ==============================================================================
          1. APPEARANCE SECTION
          ============================================================================== */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '28px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Palette size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Choose how MiniCRM looks and feels on your display
            </p>
          </div>
        </div>

        {/* Theme Mode Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Interface Theme
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Dark Theme Button */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border-medium)'}`,
                backgroundColor: theme === 'dark' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                boxShadow: theme === 'dark' ? '0 0 20px var(--primary-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#0F1523',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                  }}
                >
                  <Moon size={16} />
                </div>
                {theme === 'dark' && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} />
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Dark Theme</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Glassmorphism & deep graphite
              </span>
            </button>

            {/* Light Theme Button */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border-medium)'}`,
                backgroundColor: theme === 'light' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                boxShadow: theme === 'light' ? '0 0 20px var(--primary-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <Sun size={16} />
                </div>
                {theme === 'light' && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} />
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Light Theme</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                High-contrast clean workspace
              </span>
            </button>

            {/* System Preference Button */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${theme === 'system' ? 'var(--primary)' : 'var(--border-medium)'}`,
                backgroundColor: theme === 'system' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                boxShadow: theme === 'system' ? '0 0 20px var(--primary-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Monitor size={16} />
                </div>
                {theme === 'system' && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} />
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Default</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Matches OS ({resolvedTheme})
              </span>
            </button>
          </div>
        </div>

        {/* Accent Color Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Accent Color
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {/* Violet */}
            <button
              type="button"
              onClick={() => setAccent('violet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `2px solid ${accent === 'violet' ? '#8B5CF6' : 'var(--border-medium)'}`,
                backgroundColor: accent === 'violet' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
                boxShadow: accent === 'violet' ? '0 0 16px rgba(139, 92, 246, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  boxShadow: '0 0 8px #7C3AED',
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Violet / Indigo</span>
            </button>

            {/* Blue */}
            <button
              type="button"
              onClick={() => setAccent('blue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `2px solid ${accent === 'blue' ? '#0284C7' : 'var(--border-medium)'}`,
                backgroundColor: accent === 'blue' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
                boxShadow: accent === 'blue' ? '0 0 16px rgba(2, 132, 199, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284C7, #2563EB)',
                  boxShadow: '0 0 8px #0284C7',
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Electric Blue</span>
            </button>

            {/* Green */}
            <button
              type="button"
              onClick={() => setAccent('green')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `2px solid ${accent === 'green' ? '#059669' : 'var(--border-medium)'}`,
                backgroundColor: accent === 'green' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                boxShadow: accent === 'green' ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669, #10B981)',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Emerald Green</span>
            </button>
          </div>
        </div>

        {/* Compact Mode Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutGrid size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Compact Density Mode
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Reduces spacing and padding for higher information density in tables, cards, and pipeline
              </span>
            </div>
          </div>

          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '46px',
              height: '24px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: compactMode ? 'var(--primary)' : 'var(--border-strong)',
                borderRadius: '24px',
                transition: 'all 200ms ease',
                boxShadow: compactMode ? '0 0 10px var(--primary-glow)' : 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: compactMode ? '25px' : '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 200ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </span>
          </label>
        </div>
      </section>

      {/* ==============================================================================
          2. USER PROFILE SECTION
          ============================================================================== */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '28px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Profile Details</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Manage your identity information stored in your Supabase profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email (Read-Only) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span>Account Email</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                }}
              >
                <Lock size={11} /> Managed by Supabase Auth
              </span>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input"
              style={{
                opacity: 0.75,
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Full Name (Editable) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="settings-fullname" className="form-label">
              <span>Full Name</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Stored in public.profiles</span>
            </label>
            <input
              id="settings-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loadingProfile || savingProfile}
              placeholder="e.g. Alex Morgan"
              className="form-input"
              required
            />
          </div>

          {/* Read-Only Account Metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>User ID</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {user?.id ? `${user.id.substring(0, 18)}...` : 'Unknown'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Account Created</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {profileCreatedAt ? formatDate(profileCreatedAt) : 'Active'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingProfile || savingProfile}
              style={{ padding: '10px 20px', borderRadius: '10px' }}
            >
              <Save size={15} />
              {savingProfile ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>

      {/* ==============================================================================
          3. PREFERENCES SECTION
          ============================================================================== */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '28px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Preferences</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Set date formatting and regional behavior across the CRM
            </p>
          </div>
        </div>

        {/* Date Format Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Date Display Format
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { format: 'MMM D, YYYY' as DateFormatOption, label: 'Standard (Oct 24, 2026)' },
              { format: 'MM/DD/YYYY' as DateFormatOption, label: 'US (10/24/2026)' },
              { format: 'DD/MM/YYYY' as DateFormatOption, label: 'International (24/10/2026)' },
              { format: 'YYYY-MM-DD' as DateFormatOption, label: 'ISO Standard (2026-10-24)' },
            ].map((opt) => {
              const isSelected = dateFormat === opt.format;
              return (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => setDateFormat(opt.format)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-medium)'}`,
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    boxShadow: isSelected ? '0 0 16px var(--primary-glow)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.format}</span>
                    {isSelected && <Check size={14} color="var(--primary)" />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Preview: {formatDate(todayIso)}
                  </span>
                </button>
              );
            })}
          </div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Applied consistently across Customer Directory, Interaction Notes, and Dashboard.
          </span>
        </div>

        {/* Persistence Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            All appearance, theme, accent, and date formatting preferences are persisted automatically in your browser's local storage across sessions.
          </span>
        </div>
      </section>
    </div>
  );
};
