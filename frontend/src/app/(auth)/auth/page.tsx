"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { SiGoogle } from "react-icons/si";
import { useSearchParams } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";

// Enhanced client-side logging function
const logAuth = async (action: string, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    ...details,
  };
  
  console.log(`[Auth] ${action}`, logData);
  
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

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Check for error parameter
  useEffect(() => {
    if (searchParams) {
      const error = searchParams.get('error');
      if (error) {
        logAuth('Authentication error from query param', { errorType: error });
        
        toast({
          title: "Authentication Failed",
          description: "There was an error during the authentication process. Please try again.",
          type: "error",
        });
      }
    }
  }, [searchParams, toast]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Log the authentication attempt
      await logAuth('Google login initiated', { 
        timestamp: new Date().toISOString()
      });
      
      // Redirect to our backend Google OAuth route with proper API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const redirectUrl = `${apiUrl}/auth/google`;
      
      await logAuth('Redirecting to OAuth endpoint', { 
        redirectUrl 
      });
      
      window.location.href = redirectUrl;
    } catch (error) {
      await logAuth('Error during login redirect', { error });
      setIsLoading(false);
      
      toast({
        title: "Authentication Error",
        description: "Could not connect to authentication service. Please try again later.",
        type: "error",
      });
    }
  };

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