"use client";

import { usePathname } from 'next/navigation';
import { getSidebarNavItems, findActiveNavItem, mapNavItemsWithActive, NavItem } from '@/lib/sidebar-nav';

interface UseSidebarNavReturn {
  navItems: (NavItem & { isActive: boolean })[];
  activeItem: NavItem | undefined;
}

/**
 * Hook for sidebar navigation logic
 * Handles route matching and active state detection
 * @param variant - 'main' or 'dashboard' sidebar variant
 * @returns Navigation items with active state and current active item
 */
export function useSidebarNav(variant: 'main' | 'dashboard'): UseSidebarNavReturn {
  const pathname = usePathname();
  
  // Get nav items for this variant
  const navItems = getSidebarNavItems(variant);
  
  // Find active item based on pathname (longest match wins)
  const activeItem = findActiveNavItem(navItems, pathname);
  
  // Map items with active state
  const itemsWithActive = mapNavItemsWithActive(navItems, activeItem, pathname);
  
  return {
    navItems: itemsWithActive,
    activeItem,
  };
}
