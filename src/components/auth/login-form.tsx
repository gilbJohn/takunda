"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { API_CONFIG } from "@/lib/config/api";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (await login(email, password)) {
        const completed = useAuthStore.getState().user?.onboardingCompleted;
        const redirect = typeof window !== "undefined" ? sessionStorage.getItem("takunda-join-redirect") : null;
        if (redirect) {
          if (typeof window !== "undefined") sessionStorage.removeItem("takunda-join-redirect");
          router.push(redirect);
        } else {
          router.push(completed ? "/dashboard" : "/onboarding");
        }
      } else {
        setError(
          API_CONFIG.useSupabase
            ? "Invalid email or password. Don't have an account? Sign up first."
            : "Invalid email or password. Try: alex@example.com / password"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email (not username)
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-gray-900 hover:underline dark:text-gray-50">
          Sign up
        </Link>
      </p>
    </div>
  );
}
