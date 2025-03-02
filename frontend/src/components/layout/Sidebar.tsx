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
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: PieChart },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={cn("w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-full flex flex-col", className)}>
      <div className="p-4 flex items-center border-b dark:border-gray-700">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-2">
          <span className="text-white font-bold">E</span>
        </div>
        <span className="text-lg font-semibold">Ebiz Inc</span>
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
  );
} 