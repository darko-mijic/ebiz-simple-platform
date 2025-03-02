"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { setAuthCookie } from '../../lib/set-auth-cookie';

// Simple mock of authentication for demo purposes
// In a real app, this would use a proper auth library
const useAuth = () => {
  // Mock implementation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check for auth cookie or localStorage token
    const hasAuthCookie = document.cookie.includes('auth_session');
    setIsAuthenticated(hasAuthCookie);
    
    // For demo purposes, set a cookie to simulate being logged in
    if (process.env.NODE_ENV === 'development' && !hasAuthCookie) {
      setAuthCookie();
      setIsAuthenticated(true);
    }
  }, []);
  
  return { isAuthenticated };
};

export default function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated === false) {
      // User is not authenticated, redirect to home
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [isAuthenticated, router, toast]);
  
  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If authenticated, render children
  return <>{children}</>;
} 