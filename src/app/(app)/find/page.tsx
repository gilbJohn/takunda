"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useUserSearch } from "@/hooks/use-user-search";
import { UserSearch } from "@/components/social/user-search";
import { ProfileCard } from "@/components/profile/profile-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_CLASSES } from "@/data/mock";
import { Users } from "lucide-react";

export default function FindPage() {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const results = useUserSearch({
    currentUserId: user?.id,
    searchQuery,
    classIds: selectedClassIds,
  });

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <PageHeader
        title="Find classmates"
        description="Search for students in your classes"
      />
      <UserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClassIds={selectedClassIds}
        onClassFilterChange={setSelectedClassIds}
      />
      {results.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No results found"
          description="Try adjusting your search or class filters."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((u) => (
            <ProfileCard
              key={u.id}
              user={u}
              classes={u.classIds
                .map((id) => MOCK_CLASSES.find((c) => c.id === id))
                .filter(Boolean) as typeof MOCK_CLASSES}
            />
          ))}
        </div>
      )}
    </div>
  );
}
