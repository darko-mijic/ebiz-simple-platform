import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import SidebarWrapper from '../../components/layout/SidebarWrapper';
import HeaderWrapper from '../../components/layout/HeaderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ebiz Platform',
  description: 'Financial management platform for small to medium-sized businesses in the EU',
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar as a client component wrapper */}
      <SidebarWrapper />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header as a client component wrapper */}
        <HeaderWrapper />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 