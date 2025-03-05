"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../../hooks/use-auth";
import { useToast } from "../../../../hooks/use-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Get the token from the URL
    const token = searchParams?.get("token");

    if (!token) {
      toast({
        title: "Authentication Failed",
        description: "No authentication token received.",
        type: "error",
      });
      router.push("/auth");
      return;
    }

    try {
      // Store the token
      setToken(token);
      
      // Success message
      toast({
        title: "Authentication Successful",
        description: "You have been logged in successfully.",
        type: "success",
      });
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error handling authentication callback:", error);
      toast({
        title: "Authentication Failed",
        description: "There was a problem processing your login.",
        type: "error",
      });
      router.push("/auth");
    }
  }, [searchParams, router, setToken, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Authenticating...</h1>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
} 