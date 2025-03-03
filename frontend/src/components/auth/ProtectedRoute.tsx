"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../hooks/use-user';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If we have a user, render the children
  if (user) {
    return <>{children}</>;
  }

  // Otherwise don't render anything while redirecting
  return null;
} 