/**
 * Sidebar navigation configuration
 * Centralized navigation items for main and dashboard sidebars
 */

import { LayoutDashboard, FolderKanban, FileText, Settings, MessageCircle } from 'lucide-react';

export interface NavItem {
  title: string;
  icon: any; // Lucide icon component
  url: string;
}

/**
 * Main navigation items for authenticated users
 * Used in main layout sidebar
 */
export const mainNavItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/reports" },
  { title: "Settings", icon: Settings, url: "/settings" },
  { title: "Chat", icon: MessageCircle, url: "/chat" },
];

/**
 * Dashboard navigation items
 * Used in dashboard-specific sidebar
 */
export const dashboardNavItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/dashboard/reports" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

/**
 * Get sidebar navigation items based on variant
 * @param variant - 'main' or 'dashboard'
 * @returns Navigation items array
 */
export function getSidebarNavItems(variant: 'main' | 'dashboard'): NavItem[] {
  return variant === 'main' ? mainNavItems : dashboardNavItems;
}

/**
 * Find the active navigation item based on current pathname
 * Uses longest URL match to prevent parent routes from staying active
 * when a child route is active (e.g., /dashboard stays inactive when
 * /dashboard/projects is the current page)
 * @param navItems - Navigation items array
 * @param pathname - Current pathname
 * @returns Active navigation item or undefined
 */
export function findActiveNavItem(navItems: NavItem[], pathname: string): NavItem | undefined {
  return navItems.reduce((best, item) => {
    const matches =
      pathname === item.url ||
      (item.url !== '/' && pathname.startsWith(item.url + '/')) ||
      (pathname.startsWith(item.url) && item.url === pathname);

    if (!matches) return best;
    if (!best || item.url.length > best.url.length) return item;
    return best;
  }, undefined as any);
}

/**
 * Map navigation items with active state
 * @param navItems - Navigation items array
 * @param activeItem - Currently active navigation item
 * @param pathname - Current pathname (fallback check)
 * @returns Navigation items with isActive property
 */
export function mapNavItemsWithActive(
  navItems: NavItem[],
  activeItem: NavItem | undefined,
  pathname: string
) {
  return navItems.map((item) => ({
    ...item,
    isActive: activeItem
      ? activeItem.url === item.url
      : pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url)),
  }));
}
