import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock notificationService so that AppLayout and NotificationDropdown do not invoke
// unmocked background Supabase polling during component unit tests
vi.mock('../services/notificationService', () => ({
  notificationService: {
    getAll: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    syncSystemNotifications: vi.fn().mockResolvedValue([]),
  },
}));
