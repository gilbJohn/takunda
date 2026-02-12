"use client";

import { useAuthStore } from "@/stores/auth-store";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Gamepad2 } from "lucide-react";

export default function GamesPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <PageHeader
        title="Games"
        description="Study games and trivia"
      />
      <EmptyState
        icon={<Gamepad2 className="h-12 w-12" />}
        title="Coming soon"
        description="Trivia and study games will be available here. Stay tuned!"
      />
    </div>
  );
}
