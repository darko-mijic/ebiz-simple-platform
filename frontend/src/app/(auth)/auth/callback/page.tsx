'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../../hooks/use-toast';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Get token from URL params
    const token = searchParams.get('token');
    
    if (!token) {
      toast({
        title: 'Authentication failed',
        description: 'No authentication token was provided.',
        type: 'error',
      });
      setIsProcessing(false);
      router.push('/auth');
      return;
    }

    // Store token in localStorage for future requests
    localStorage.setItem('auth_token', token);
    
    // Set a cookie for server-side verification
    document.cookie = `auth_session=${token}; path=/; max-age=86400`;
    
    // Show success message
    toast({
      title: 'Authentication successful',
      description: 'You have been logged in successfully.',
      type: 'success',
    });
    
    // Redirect to dashboard
    setIsProcessing(false);
    router.push('/dashboard');
  }, [router, searchParams, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-semibold">Completing authentication...</h2>
          <p className="text-muted-foreground">Please wait while we set up your session.</p>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
} 