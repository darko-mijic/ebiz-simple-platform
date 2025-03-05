"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { useUser } from '../../hooks/use-user';

// Enhanced logging function for auth events
const logAuthCheck = async (action: string, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    ...details,
  };
  
  console.log(`[AuthCheck] ${action}`, logData);
  
  // Send to backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${apiUrl}/client-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: action,
        meta: logData,
      }),
    });
  } catch (e) {
    // Silent fail for logging
    console.error('Failed to send log to server', e);
  }
};

export default function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      logAuthCheck('User not authenticated, redirecting to auth page');
      
      // User is not authenticated, redirect to auth page
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        type: "error",
      });
      router.push('/auth');
    } else {
      logAuthCheck('User authenticated, allowing access', { userId: user.id });
    }
  }, [user, loading, router, toast]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    logAuthCheck('Authentication check in progress, showing loading spinner');
    
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If authenticated, render children
  return <>{children}</>;
} 