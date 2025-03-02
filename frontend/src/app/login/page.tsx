"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <p className="text-lg">Redirecting to login...</p>
    </div>
  );
} 