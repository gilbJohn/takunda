"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useFriends } from "@/hooks/use-friends";
import { useClasses } from "@/hooks/use-classes";
import { ProfileCard } from "@/components/profile/profile-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { Users, UserPlus, Mail, Send } from "lucide-react";
import Link from "next/link";
import type { Class } from "@/types/class";

export default function FriendsPage() {
  const user = useAuthStore((s) => s.user);
  const { classes } = useClasses();
  const {
    friends,
    pendingInvites,
    sentInvites,
    suggestions,
    isLoading,
    sendInvite,
    acceptInvite,
    declineInvite,
  } = useFriends(user?.id);

  const getClassesForUser = (classIds: string[]) =>
    classIds
      .map((id) => classes.find((c) => c.id === id))
      .filter((c): c is Class => c != null);

  if (!user) return null;

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Friends"
        description="Your friends and people you can connect with"
      />

      {isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-12">
          {/* Received friend requests */}
          {pendingInvites.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
                <Mail className="h-5 w-5 text-emerald-500" />
                Friend requests
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-300">
                  {pendingInvites.length}
                </span>
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                People who want to connect with you
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={inv.sender?.avatar}
                        fallback={inv.sender?.name}
                        className="h-12 w-12"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {inv.sender?.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {inv.sender?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptInvite(inv.id)}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvite(inv.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sent (pending) friend requests */}
          {sentInvites.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
                <Send className="h-5 w-5 text-emerald-500" />
                Pending requests
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-300">
                  {sentInvites.length}
                </span>
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                Requests you sent, awaiting response
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {sentInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={inv.recipient?.avatar}
                        fallback={inv.recipient?.name}
                        className="h-12 w-12"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {inv.recipient?.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {inv.recipient?.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* My Friends */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <Users className="h-5 w-5 text-emerald-500" />
              My friends
            </h2>
            {friends.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No friends yet"
                description="Add friends from your classes or accept friend requests above."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {friends.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <ProfileCard
                      user={u}
                      classes={getClassesForUser(u.classIds)}
                      showViewProfile={true}
                    />
                    <Link href={`/study-groups`} className="self-start">
                      <Button variant="outline" size="sm">
                        Invite to study group
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Suggestions */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <UserPlus className="h-5 w-5 text-emerald-500" />
              Suggested friends
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Classmates you can add as friends
            </p>
            {suggestions.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="h-6 w-6" />}
                title="No suggestions"
                description="Add classes to your profile to find classmates to connect with."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {suggestions.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <ProfileCard
                      user={u}
                      classes={getClassesForUser(u.classIds)}
                      showViewProfile={true}
                    />
                    <Button
                      size="sm"
                      onClick={() => sendInvite(u.id)}
                      className="self-start"
                    >
                      Add friend
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
}
