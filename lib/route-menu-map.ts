// lib/route-menu-map.ts - PRODUCTION READY WITH FIX

/**
 * Mapping of routes to menu keys for access control
 * This allows the system to check menu permissions based on the current route
 */
export const ROUTE_MENU_MAP: Record<string, string> = {
  // Dashboard
  '/dashboard': 'dashboard.access',

  // Access Control
  '/dashboard/access-control': 'dashboard.access-control.access',
  '/dashboard/access-control/users': 'dashboard.access-control.users.access',
  '/dashboard/access-control/roles': 'dashboard.access-control.roles.access',
  '/dashboard/access-control/permissions': 'dashboard.access-control.permissions.access',
  '/dashboard/access-control/menu-permissions': 'dashboard.access-control.menu-permissions.access',
  '/dashboard/access-control/roles/[id]': 'dashboard.access-control.roles.bulk-assign.access',
  '/dashboard/subscription-management': 'dashboard.subscriptions.access',
  '/dashboard/subscription-management/plans': 'dashboard.subscriptions.plans.access',
  '/dashboard/subscription-management/offers': 'dashboard.subscriptions.offers.access',
  '/dashboard/subscription-management/features': 'dashboard.subscriptions.features.access',
  '/dashboard/subscription-management/features-permission': 'dashboard.subscriptions.features-permission.access',

  // Apps
  '/dashboard/chat': 'dashboard.chat.access',

  //Plans
  '/dashboard/billing': 'dashboard.billing.access',
  '/dashboard/billing/plans': 'dashboard.billing.plans.access',
  '/dashboard/billing/payment-methods': 'dashboard.billing.payment-methods.access',

};

/**
 * Public routes that don't require authentication
 * These routes are accessible without login
 */
export const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/verify-email',
  '/auth',
  '/accept-invitation',
  '/errors/403',
  '/errors/404',
  '/errors/500',
  '/_next',
  '/api',
  '/static',
];

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  // Remove trailing slash for consistent matching
  const cleanPath = pathname.replace(/\/$/, '');

  return PUBLIC_ROUTES.some(route => {
    // Exact match
    if (cleanPath === route) return true;

    // Prefix match (for routes like /api/*, /errors/*)
    if (cleanPath.startsWith(route + '/')) return true;

    return false;
  });
}

/**
 * Get menu key from pathname
 * Handles dynamic routes like /dashboard/access-control/roles/123
 */
export function getMenuKeyFromRoute(pathname: string): string | null {
  // Remove trailing slash
  const cleanPath = pathname.replace(/\/$/, '');

  // Check for exact match first
  if (ROUTE_MENU_MAP[cleanPath]) {
    console.log('🔍 Exact match:', cleanPath, '->', ROUTE_MENU_MAP[cleanPath]);
    return ROUTE_MENU_MAP[cleanPath];
  }

  // Handle dynamic routes by checking prefixes
  // Sort routes by length (longest first) to match most specific routes first
  const sortedRoutes = Object.entries(ROUTE_MENU_MAP)
    .sort(([a], [b]) => b.length - a.length);

  for (const [route, menuKey] of sortedRoutes) {
    if (cleanPath.startsWith(route + '/') || cleanPath === route) {
      console.log('🔍 Prefix match:', cleanPath, '->', menuKey, 'via', route);
      return menuKey;
    }
  }

  // Fallback: try to derive from path
  const pathParts = cleanPath.split('/').filter(Boolean);
  if (pathParts.length > 1 && pathParts[0] === 'dashboard') {
    // Convert /dashboard/access-control/roles to access-control.roles
    const derivedKey = pathParts.slice(1).join('.');
    console.log('🔍 Derived key:', cleanPath, '->', derivedKey);
    return derivedKey;
  }

  console.warn('⚠️ No menu key found for:', cleanPath);
  return null;
}

/**
 * Get parent menu key from a menu key
 * e.g., 'access-control.roles' -> 'access-control'
 */
export function getParentMenuKey(menuKey: string): string | null {
  const parts = menuKey.split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : null;
}

/**
 * Get all parent menu keys (from immediate parent to root)
 * e.g., 'access-control.roles.edit' -> ['access-control.roles', 'access-control']
 */
export function getAllParentMenuKeys(menuKey: string): string[] {
  const parts = menuKey.split('.');
  const parents: string[] = [];

  // Start from length-1 to get immediate parent first
  for (let i = parts.length - 1; i > 0; i--) {
    parents.push(parts.slice(0, i).join('.'));
  }

  return parents;
}

/**
 * Check if a menu key is a child of another menu key
 * e.g., 'access-control.roles' is child of 'access-control'
 */
export function isChildMenu(childKey: string, parentKey: string): boolean {
  return childKey.startsWith(parentKey + '.');
}

/**
 * Get all child menu keys for a parent
 * e.g., 'access-control' -> ['access-control.roles', 'access-control.permissions', ...]
 */
export function getChildMenuKeys(parentKey: string, allMenuKeys: string[]): string[] {
  return allMenuKeys.filter(key => isChildMenu(key, parentKey));
}