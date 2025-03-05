"use client";

import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Menu, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useUser } from '../../hooks/use-user';

interface HeaderProps {
  className?: string;
  onToggleSidebar?: () => void;
  toggleTheme?: () => void;
  theme?: string;
}

export function Header({ className, onToggleSidebar, toggleTheme, theme }: HeaderProps) {
  const pathname = usePathname() || '';
  const { user, logout } = useUser();

  // Get the page title based on the current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/bank-accounts')) return 'Bank Accounts';
    if (pathname.startsWith('/transactions')) return 'Transactions';
    if (pathname.startsWith('/documents')) return 'Documents';
    if (pathname.startsWith('/chat')) return 'Chat';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className={cn('h-16 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6', className)}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center mr-2">
            <span className="text-sm mr-2">
              {user.firstName} {user.lastName}
            </span>
            {user.profilePictureUrl && (
              <img 
                src={user.profilePictureUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
        )}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
} 