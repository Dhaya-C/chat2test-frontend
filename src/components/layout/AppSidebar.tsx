"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { BaseSidebar } from '@/components/ui/BaseSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarNav } from '@/hooks/useSidebarNav';
import { useUserInfo } from '@/hooks/useUserInfo';
import { UserMenu } from '@/components/shared/UserMenu';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  variant: 'main' | 'dashboard';
}

export function AppSidebar({ open, onToggle, variant }: AppSidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { navItems, activeItem } = useSidebarNav(variant);
  const { displayName, initials, email } = useUserInfo();

  const handleSettings = () => {
    router.push(variant === 'main' ? '/settings' : '/dashboard/settings');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <BaseSidebar
      navItems={navItems}
      open={open}
      onToggle={onToggle}
      title={
        <div className="flex flex-col">
          <div className="font-bold text-lg flex-1 text-sidebar-foreground">TestSamurAI</div>
          {open && (
            <div className="flex items-center gap-7 mt-1">
              <span className="text-[10px] text-muted-foreground -mt-5">Powered by</span>
              <img src="/company-logo.png" alt="Vdart Digit" className="h-7 w-20 brightness-0 invert" />
            </div>
          )}
        </div>
      }
      footer={
        <UserMenu
          displayName={displayName}
          initials={initials}
          email={email}
          open={open}
          theme={theme || 'light'}
          onLogout={logout}
          onThemeToggle={handleThemeToggle}
        />
      }
    />
  );
}