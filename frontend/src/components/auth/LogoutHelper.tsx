"use client";

import { useEffect } from 'react';
import { useUser } from '../../components/providers/user-provider';

/**
 * A utility component that makes the logout function accessible from the browser console
 * for testing purposes. This exposes a global window.logoutUser() function.
 */
export default function LogoutHelper() {
  const { logout } = useUser();
  
  useEffect(() => {
    // Make logout available in the browser console for testing
    if (typeof window !== 'undefined') {
      // Type declaration to avoid TypeScript errors
      (window as any).logoutUser = async () => {
        try {
          // Log that the logout was called from console
          console.info('Logout function called from browser console');
          
          // Send structured log to backend
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await fetch(`${apiUrl}/client-logs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: 'Manual logout triggered from browser console',
                meta: {
                  timestamp: new Date().toISOString(),
                  source: 'browser_console'
                },
              }),
            });
          } catch (e) {
            // Silent fail for logging
          }
          
          // Call the actual logout function
          await logout();
          
          return 'Logout successful';
        } catch (error) {
          console.error('Error during console logout:', error);
          return 'Logout failed: ' + (error instanceof Error ? error.message : 'Unknown error');
        }
      };
      
      console.info('Logout helper initialized. Use window.logoutUser() to log out.');
    }
    
    return () => {
      // Clean up when component unmounts
      if (typeof window !== 'undefined') {
        delete (window as any).logoutUser;
      }
    };
  }, [logout]);
  
  // This component doesn't render anything
  return null;
} 