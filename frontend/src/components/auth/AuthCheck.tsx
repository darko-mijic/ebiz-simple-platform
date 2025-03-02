"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';

// Improved auth implementation to work with backend Google OAuth
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication status with the backend
        const response = await fetch(`${apiUrl}/auth/check`, {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl]);
  
  return { isAuthenticated, isLoading, user };
};

export default function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated === false) {
      // User is not authenticated, redirect to auth page
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        type: "error",
      });
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router, toast]);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If authenticated, render children
  return <>{children}</>;
} 