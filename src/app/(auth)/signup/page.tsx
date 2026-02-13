"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { useAuthStore } from "@/stores/auth-store";

export default function SignupPage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-block text-sm font-medium text-slate-400 hover:text-emerald-500"
      >
        ← Back to home
      </Link>
      <SignupForm />
    </div>
  );
}
