"use client";

import React from 'react';
import { Sun, Moon, LogOut, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  displayName: string;
  initials: string;
  email: string | undefined;
  open: boolean;
  theme: string;
  onLogout: () => void;
  onThemeToggle: () => void;
}

/**
 * User dropdown menu component
 * Displays user info, theme toggle, and logout options
 * Extracted from AppSidebar for better modularity and reusability
 */
export function UserMenu({
  displayName,
  initials,
  email,
  open,
  theme,
  onLogout,
  onThemeToggle,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${open ? 'w-full' : ''} flex items-center gap-2 px-2 hover:bg-sidebar-accent h-auto py-2 ${
            open ? 'justify-start' : 'justify-center'
          }`}
        >
          <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {open && (
            <>
              <div className="flex flex-col items-start text-left flex-1 overflow-hidden min-w-0">
                <span className="text-sm font-medium truncate w-full text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full">{email}</span>
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onThemeToggle}>
            {theme === 'dark' ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark mode</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
