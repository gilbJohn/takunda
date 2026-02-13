"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const onboardingCompleted = useAuthStore((s) => s.user?.onboardingCompleted);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(onboardingCompleted ? "/dashboard" : "/onboarding");
    }
  }, [isLoggedIn, onboardingCompleted, router]);

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-block text-sm font-medium text-slate-400 hover:text-emerald-500"
      >
        ← Back to home
      </Link>
      <LoginForm />
    </div>
  );
}
