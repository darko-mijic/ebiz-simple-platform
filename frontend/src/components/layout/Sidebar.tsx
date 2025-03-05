"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  PieChart,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

export function Sidebar({ className, collapsed = false }: SidebarProps) {
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: PieChart },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Get user initials for avatar
  const userInitials = user?.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : "U";

  return (
    <div className={cn("bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full flex flex-col", className)}>
      <div className="p-4 flex items-center border-b dark:border-gray-700">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-2">
          <span className="text-white font-bold">E</span>
        </div>
        {!collapsed && <span className="text-lg font-semibold">Ebiz Inc</span>}
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
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
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t dark:border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-gray-600 dark:text-white font-bold">{userInitials}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{user?.firstName || 'User'} {user?.lastName || ''}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@ebiz.com'}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 