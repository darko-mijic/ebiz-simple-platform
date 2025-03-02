"use client";

import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/theme-provider';

interface HeaderProps {
  className?: string;
  onToggleSidebar?: () => void;
}

export function Header({ className, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Get the page title based on the current path
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    return pathname.split('/')[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn('h-16 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6', className)}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
} 