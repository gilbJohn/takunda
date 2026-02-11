"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/stores/auth-store";
import { useStudyStore } from "@/stores/study-store";
import { isApiEnabled } from "@/lib/config/api";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loadDecks = useStudyStore((s) => s.loadDecks);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isApiEnabled()) {
      loadDecks();
    }
  }, [isLoggedIn, loadDecks]);

  if (!isLoggedIn) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
