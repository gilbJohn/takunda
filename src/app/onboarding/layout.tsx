"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const onboardingCompleted = useAuthStore((s) => s.user?.onboardingCompleted);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, onboardingCompleted, router]);

  if (!isLoggedIn || onboardingCompleted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
