"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  PieChart,
  Menu,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../providers/theme-provider';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: PieChart },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full flex flex-col">
        <div className="p-4 flex items-center border-b dark:border-gray-700">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-2">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-lg font-semibold">Ebiz Inc</span>
        </div>
        
        <nav className="flex-1 py-4 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 text-primary"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-gray-600 dark:text-white font-bold">U</span>
            </div>
            <div>
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">user@ebiz.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
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
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 