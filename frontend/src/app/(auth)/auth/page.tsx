"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { FaUserSecret } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../hooks/use-toast";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "../../../hooks/use-auth";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Use the backend API URL for Google OAuth
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const authUrl = `${backendUrl}/auth/google`;
      console.log(`Redirecting to Google OAuth at ${authUrl}`);
      
      // Use window.location.replace for a cleaner redirect
      window.location.replace(authUrl);
    } catch (error) {
      console.error('Error during Google login redirect:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to redirect to Google login. Please try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };
  
  const handleMockLogin = async () => {
    try {
      setIsLoading(true);
      // Use the backend API URL for Mock OAuth
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const authUrl = `${backendUrl}/auth/mock`;
      console.log(`Redirecting to Mock OAuth at ${authUrl}`);
      
      window.location.replace(authUrl);
    } catch (error) {
      console.error('Error during Mock login redirect:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to redirect to Mock login. Please try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  // If still checking auth status, show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Checking Authentication...</h1>
          <p className="text-muted-foreground">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  // Only render login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left side - Dark background with logo and testimonial */}
        <div className="bg-black p-8 flex flex-col justify-between text-white hidden md:flex relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-black">E</span>
              </div>
              Ebiz Inc
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <blockquote className="text-lg font-medium">
              "This app has saved me countless hours of work and helped me deliver
              stunning financial insights to my clients faster than ever before."
            </blockquote>
            <p className="text-sm text-gray-400">Sofia Davis</p>
          </div>

          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Right side - Login form */}
        <div className="flex flex-col justify-between p-8 bg-background">
          <div className="md:hidden flex items-center gap-2 text-lg font-semibold">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white">E</span>
            </div>
            Ebiz Inc
          </div>

          <Card className="p-8 max-w-sm mx-auto w-full shadow-md">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Get started by signing in with your Google account
                </p>
              </div>

              <Button 
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <SiGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              
              {/* Mock OAuth button - Only visible in development */}
              {isDevelopment && (
                <Button 
                  className="w-full mt-2 border-orange-500 hover:bg-orange-50"
                  onClick={handleMockLogin} 
                  disabled={isLoading}
                  variant="outline" 
                >
                  <FaUserSecret className="mr-2 h-4 w-4 text-orange-500" />
                  <span className="text-orange-500">Continue with Mock Auth</span>
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <a href="#" className="underline underline-offset-2 hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 hover:text-primary">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </Card>

          <div className="h-8" /> {/* Spacer */}
        </div>
      </div>
    );
  }

  // This should never show as we redirect
  return null;
} 