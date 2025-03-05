"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { authLogger } from '../../lib/console-logger';

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePictureUrl: string | null;
  googleId?: string;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    authLogger.info('Fetching user authentication state', undefined, 'auth');
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      authLogger.debug(`API Request: GET ${apiUrl}/auth/check`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }, 'api');
      
      const response = await fetch(`${apiUrl}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      authLogger.debug(`Response status: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const logGroup = authLogger.group('Auth check response', 'debug', true);
        authLogger.debug('Response data', data);
        logGroup.end();
        
        // Check for special error cases from the backend
        if (data.error === 'user_not_found' && data.action === 'clear_cookies') {
          authLogger.warn('User not found in database', {
            message: 'This can happen after database resets',
            action: 'clear_cookies'
          });
          
          setUser(null);
          
          // Redirect to auth page after a short delay
          setTimeout(() => {
            window.location.href = '/auth?reason=user_not_found';
          }, 500);
          
          return;
        }
        
        if (data.isAuthenticated && data.user) {
          authLogger.success('User authenticated', data.user, 'user');
          setUser(data.user);
        } else {
          authLogger.warn('User not authenticated', data);
          setUser(null);
        }
      } else {
        // Don't set an error if authentication fails, 
        // the auth component will handle redirects
        authLogger.warn(`Auth check failed (${response.status})`, {
          status: response.status,
          statusText: response.statusText
        });
        setUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      authLogger.error('Error fetching user data', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      
      setError('Failed to fetch user data');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/auth/logout`, {}, {
        withCredentials: true,
      });
      setUser(null);
      // Reload the page to clear any client-side state
      window.location.href = '/auth';
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // Add a log when auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        authLogger.info('Auth state: Authenticated', {
          user: {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
          }
        }, 'auth');
      } else {
        authLogger.info('Auth state: Not authenticated', {
          hasError: !!error,
          error: error
        }, 'auth');
      }
    }
  }, [user, loading, error]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser: fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
} 