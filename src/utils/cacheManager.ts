/**
 * Cache Manager for MiniCRM
 * Handles clearing sensitive user-specific data from localStorage upon sign-out,
 * preventing cross-session data leakage between accounts on shared devices.
 * Leaves UI preferences (theme, accent color, compact mode, date format) intact.
 */

export const CRM_DATA_CACHE_KEYS = [
  'minicrm_deals_cache',
  'minicrm_tasks_cache',
  'minicrm_meetings_cache',
  'minicrm_companies_cache',
  'minicrm_sales_goals_cache',
  'minicrm_notifications_cache',
  'minicrm_workspaces_cache',
  'minicrm_active_workspace_id',
  'minicrm_fav_customers',
] as const;

export function clearCrmUserData(): void {
  try {
    for (const key of CRM_DATA_CACHE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('Could not clean CRM local cache on logout:', err);
  }
}
