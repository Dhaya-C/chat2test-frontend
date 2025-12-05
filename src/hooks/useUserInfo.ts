"use client";

import { useAuth } from './useAuth';

interface UserDisplayInfo {
  displayName: string;
  initials: string;
  email: string | undefined;
}

/**
 * Hook for user display information
 * Handles name formatting, email parsing, and avatar initials calculation
 * @returns User display information (name, initials, email)
 */
export function useUserInfo(): UserDisplayInfo {
  const { user } = useAuth();

  // Get display name from user name or email
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  // Calculate initials from name or display name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : displayName.substring(0, 2).toUpperCase();

  return {
    displayName,
    initials,
    email: user?.email,
  };
}
