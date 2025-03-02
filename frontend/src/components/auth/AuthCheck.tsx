"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';

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

// Improved auth implementation to work with backend Google OAuth
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await logAuthCheck('Checking authentication status', { apiUrl });
        
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
          await logAuthCheck('Authentication check successful', { 
            isAuthenticated: true,
            userId: data.user?.id,
          });
          
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          await logAuthCheck('Authentication check failed', { 
            status: response.status,
            statusText: response.statusText,
          });
          
          setIsAuthenticated(false);
        }
      } catch (error) {
        await logAuthCheck('Authentication check error', { 
          error: error instanceof Error ? error.message : String(error),
        });
        
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl]);

  // Add a function to handle explicit logout
  const logout = async () => {
    try {
      await logAuthCheck('Logging out user');
      
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        await logAuthCheck('Logout successful');
        setIsAuthenticated(false);
        setUser(null);
        return true;
      } else {
        await logAuthCheck('Logout failed', { 
          status: response.status, 
          statusText: response.statusText 
        });
        return false;
      }
    } catch (error) {
      await logAuthCheck('Logout error', { 
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  };
  
  return { isAuthenticated, isLoading, user, logout };
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
      logAuthCheck('User not authenticated, redirecting to auth page');
      
      // User is not authenticated, redirect to auth page
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        type: "error",
      });
      router.push('/auth');
    } else if (isAuthenticated === true) {
      logAuthCheck('User authenticated, allowing access');
    }
  }, [isAuthenticated, isLoading, router, toast]);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
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