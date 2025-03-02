"use client";

import { useEffect } from 'react';
import { Dashboard } from "../page";
import { setAuthCookie } from "../../../lib/set-auth-cookie";

// This dashboard page properly imports the Dashboard component from the parent directory
// Ensuring it's properly accessible from the sidebar navigation
export default function DashboardPage() {
  // Set auth cookie for development testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setAuthCookie();
    }
  }, []);

  return <Dashboard />;
} 