import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import AuthCheck from '../../components/auth/AuthCheck';
import LayoutWrapper from '../../components/layout/LayoutWrapper';

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
    <AuthCheck>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </AuthCheck>
  );
} 