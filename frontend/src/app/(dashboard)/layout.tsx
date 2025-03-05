"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth has loaded and user isn't authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
} 