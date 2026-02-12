"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { joinClassByToken, getUser } from "@/lib/api";
import { updateProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";

const REDIRECT_KEY = "takunda-join-redirect";

export default function JoinByTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "need-auth">("loading");
  const [message, setMessage] = useState("");
  const joinStartedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid link");
      return;
    }
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REDIRECT_KEY, `/join/${token}`);
      }
      setStatus("need-auth");
      return;
    }
    if (joinStartedRef.current) return; // Prevent double execution when user reference changes
    joinStartedRef.current = true;

    joinClassByToken(token, user.id)
      .then(async (result) => {
        if (!result) {
          setStatus("error");
          setMessage("Invalid or expired join link");
          return;
        }
        if (user && !user.classIds.includes(result.classId)) {
          const newClassIds = [...user.classIds, result.classId];
          await updateProfile({
            userId: user.id,
            classIds: newClassIds,
            _currentUser: user,
          });
        }
        const updated = await getUser(user.id);
        if (updated) setUser(updated);
        setStatus("success");
        setTimeout(() => router.replace("/study-groups"), 1500);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Failed to join. Please try again.");
      });
  }, [token, user, router, setUser]);

  if (status === "need-auth") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Join class
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in or create an account to join this class.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Joining...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
            Could not join
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          <Link href="/dashboard">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-500">Success! Redirecting to study groups...</p>
    </div>
  );
}
