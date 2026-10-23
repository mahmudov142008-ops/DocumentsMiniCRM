import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((prev) => {
      // Prevent showing the exact same notification simultaneously
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
      return [...prev, { id, message, type }];
    });
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
  }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            style={{
              pointerEvents: 'auto',
              background: item.type === 'error' ? 'var(--danger-subtle)' : item.type === 'success' ? 'var(--status-new-bg)' : 'var(--bg-card)',
              color: item.type === 'error' ? 'var(--danger)' : item.type === 'success' ? 'var(--status-new-text)' : 'var(--text-primary)',
              border: `1px solid ${item.type === 'error' ? 'var(--danger-border)' : item.type === 'success' ? 'var(--status-new-border)' : 'var(--border-medium)'}`,
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.875rem',
              animation: 'slideUp 200ms ease-out',
            }}
          >
            {item.type === 'success' && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
            {item.type === 'error' && <AlertCircle size={18} style={{ flexShrink: 0 }} />}
            {item.type === 'info' && <Info size={18} style={{ flexShrink: 0 }} />}
            <span style={{ flex: 1, lineHeight: 1.4 }}>{item.message}</span>
            <button
              onClick={() => removeToast(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                opacity: 0.7,
                display: 'flex',
                padding: '2px',
              }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
