"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useStudyGroups } from "@/hooks/use-study-groups";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { UsersRound, Calendar, Plus } from "lucide-react";
import type { StudyGroup } from "@/types/study-group";

function GroupCard({
  group,
  showJoin,
  onJoin,
}: {
  group: StudyGroup;
  showJoin?: boolean;
  onJoin?: () => void;
}) {
  const nextSession = group.nextSession;
  const dateStr = nextSession
    ? new Date(nextSession.scheduledAt).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-100">{group.name}</h3>
          {group.class && (
            <p className="text-sm text-slate-400">
              {group.class.code ?? group.class.name}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-400">
            {group.memberCount ?? 0} members
          </p>
          {dateStr && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              Next: {dateStr}
            </p>
          )}
        </div>
        {showJoin && onJoin ? (
          <Button size="sm" onClick={onJoin}>
            Join
          </Button>
        ) : (
          <Link href={`/study-groups/${group.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StudyGroupsPage() {
  const user = useAuthStore((s) => s.user);
  const { myGroups, discoverable, upcomingSessions, isLoading, createGroup, joinGroup } =
    useStudyGroups(user?.id, user?.classIds ?? []);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    await createGroup(createName.trim());
    setCreateName("");
    setCreateOpen(false);
  };

  if (!user) return null;

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Study Groups" description="Your groups and discover new ones" />

      {isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-12">
          {/* Calendar - Upcoming sessions */}
          {upcomingSessions.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Upcoming sessions
              </h2>
              <div className="space-y-2">
                {upcomingSessions.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/study-groups/${s.groupId}`}
                    className="block rounded-xl border border-slate-800 bg-slate-900 p-3 transition-colors hover:border-slate-700 hover:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-100">{s.groupName}</span>
                      <span className="text-sm text-slate-400">
                        {new Date(s.scheduledAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {s.location && (
                      <p className="mt-1 text-sm text-slate-400">
                        {s.location}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* My Groups */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <UsersRound className="h-5 w-5 text-emerald-500" />
              My groups
            </h2>
            {myGroups.length === 0 ? (
              <EmptyState
                icon={<UsersRound className="h-6 w-6" />}
                title="No study groups yet"
                description="Add classes to your profile to auto-join class groups, or create a general study group."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myGroups.map((g) => (
                  <GroupCard key={g.id} group={g} />
                ))}
              </div>
            )}
          </section>

          {/* Create general group */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">
              Create general study group
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Create a group for homework buddies (not tied to a class)
            </p>
            {createOpen ? (
              <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Group name"
                  className="flex h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <Button type="submit" disabled={!createName.trim()}>
                  Create
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create group
              </Button>
            )}
          </section>

          {/* Discovery */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">
              Discover groups
            </h2>
            {discoverable.length === 0 ? (
              <EmptyState
                icon={<UsersRound className="h-6 w-6" />}
                title="No other groups"
                description="All available groups are in your list above."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {discoverable.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    showJoin
                    onJoin={() => joinGroup(g.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
}
