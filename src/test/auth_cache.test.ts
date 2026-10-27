import { describe, it, expect, beforeEach } from 'vitest';
import { clearCrmUserData, CRM_DATA_CACHE_KEYS } from '../utils/cacheManager';

describe('Cache Manager — Local Data Isolation & Sign Out', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes all CRM data caches upon clearCrmUserData', () => {
    // Populate CRM data cache
    localStorage.setItem('minicrm_deals_cache', JSON.stringify([{ id: 'd1', title: 'Secret Deal' }]));
    localStorage.setItem('minicrm_tasks_cache', JSON.stringify([{ id: 't1', title: 'Confidential Task' }]));
    localStorage.setItem('minicrm_meetings_cache', JSON.stringify([{ id: 'm1', title: 'Private Meeting' }]));
    localStorage.setItem('minicrm_companies_cache', JSON.stringify([{ id: 'c1', name: 'Acme Corp' }]));
    localStorage.setItem('minicrm_sales_goals_cache', JSON.stringify([{ id: 'g1', name: 'Q4 Target' }]));
    localStorage.setItem('minicrm_notifications_cache', JSON.stringify([{ id: 'n1', title: 'Alert' }]));
    localStorage.setItem('minicrm_workspaces_cache', JSON.stringify([{ id: 'w1', name: 'Team WS' }]));
    localStorage.setItem('minicrm_active_workspace_id', 'w1');
    localStorage.setItem('minicrm_fav_customers', JSON.stringify(['cust-1']));

    // Verify populated
    expect(localStorage.getItem('minicrm_deals_cache')).not.toBeNull();
    expect(localStorage.getItem('minicrm_tasks_cache')).not.toBeNull();

    // Clear CRM user data
    clearCrmUserData();

    // Verify all CRM keys are wiped
    for (const key of CRM_DATA_CACHE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('preserves user appearance preferences when clearing CRM data', () => {
    // Set UI preferences
    localStorage.setItem('minicrm_theme', 'light');
    localStorage.setItem('minicrm_accent', 'green');
    localStorage.setItem('minicrm_compact', 'true');
    localStorage.setItem('minicrm_date_format', 'DD/MM/YYYY');

    // Also populate a CRM cache
    localStorage.setItem('minicrm_deals_cache', JSON.stringify([{ id: 'd1' }]));

    clearCrmUserData();

    // CRM cache must be cleared
    expect(localStorage.getItem('minicrm_deals_cache')).toBeNull();

    // Preferences must remain intact
    expect(localStorage.getItem('minicrm_theme')).toBe('light');
    expect(localStorage.getItem('minicrm_accent')).toBe('green');
    expect(localStorage.getItem('minicrm_compact')).toBe('true');
    expect(localStorage.getItem('minicrm_date_format')).toBe('DD/MM/YYYY');
  });
});
