import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, Calendar, Trophy, AlertTriangle, X } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { taskService } from '../../services/taskService';
import { meetingService } from '../../services/meetingService';
import { dealService } from '../../services/dealService';
import { NotificationItem } from '../../types/crm';
import { AppPage } from './AppLayout';

interface NotificationDropdownProps {
  onNavigate: (page: AppPage) => void;
  userId?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      if (userId) {
        const [tasks, meetings, deals] = await Promise.all([
          taskService.getAll().catch(() => []),
          meetingService.getAll().catch(() => []),
          dealService.getAll().catch(() => []),
        ]);
        const items = await notificationService.syncSystemNotifications(userId, tasks, meetings, deals);
        setNotifications(items);
      } else {
        const items = await notificationService.getAll();
        setNotifications(items);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }
    setIsOpen(false);
    if (notif.link_page) {
      onNavigate(notif.link_page as AppPage);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_overdue':
        return <AlertTriangle size={15} color="#EF4444" />;
      case 'task_due':
        return <Clock size={15} color="#F59E0B" />;
      case 'meeting_upcoming':
        return <Calendar size={15} color="#38BDF8" />;
      case 'deal_won':
        return <Trophy size={15} color="#10B981" />;
      default:
        return <Bell size={15} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        id="notifications-bell-btn"
        data-testid="notifications-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost"
        style={{
          padding: '8px',
          borderRadius: '8px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'all 150ms',
        }}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            id="unread-notifications-badge"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--primary-glow)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notifications-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: 'min(360px, calc(100vw - 24px))',
            maxHeight: '440px',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px', color: 'var(--text-tertiary)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.8125rem' }}>No notifications yet</p>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  You'll be alerted when tasks, meetings, or deals require attention.
                </span>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    backgroundColor: notif.is_read ? 'transparent' : 'var(--primary-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = notif.is_read ? 'var(--bg-hover)' : 'var(--primary-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'var(--primary-subtle)';
                  }}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: notif.is_read ? 500 : 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notif.id)}
                          style={{
                            padding: '3px',
                            borderRadius: '4px',
                            color: 'var(--primary)',
                            background: 'transparent',
                          }}
                          title="Mark as read"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                        lineHeight: 1.4,
                      }}
                    >
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
