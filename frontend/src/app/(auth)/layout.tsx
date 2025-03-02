import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ebiz Platform - Authentication',
  description: 'Sign in to access your financial dashboard',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4`}>
      {children}
    </div>
  );
} 