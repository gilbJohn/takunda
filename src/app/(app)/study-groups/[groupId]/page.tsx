"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth-store";
import {
  getStudyGroup,
  getOrCreateClassJoinToken,
  createGroupSession,
  inviteToGroupByEmail,
  joinStudyGroup,
  getFriends,
  getGroupMemberIds,
  getGroupMembers,
} from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/avatar";
import { ArrowLeft, UserPlus } from "lucide-react";
import type { StudyGroup } from "@/types/study-group";
import type { User } from "@/types/user";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

export default function StudyGroupDetailPage() {
  const params = useParams();
  const user = useAuthStore((s) => s.user);
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [joinUrlLoading, setJoinUrlLoading] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);

  const refreshGroup = useCallback(() => {
    getStudyGroup(groupId).then(setGroup);
    getGroupMemberIds(groupId).then((ids) => setMemberIds(new Set(ids)));
    getGroupMembers(groupId).then(setMembers);
  }, [groupId]);

  useEffect(() => {
    getStudyGroup(groupId)
      .then(setGroup)
      .catch(() => setGroup(null))
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => {
    if (!user) return;
    getFriends(user.id).then(setFriends);
  }, [user]);

  useEffect(() => {
    getGroupMemberIds(groupId).then((ids) => setMemberIds(new Set(ids)));
    getGroupMembers(groupId).then(setMembers);
  }, [groupId]);

  useEffect(() => {
    if (!group?.classId || typeof window === "undefined") return;
    setJoinUrlLoading(true);
    getOrCreateClassJoinToken(group.classId)
      .then((token) => {
        setJoinUrl(`${window.location.origin}/join/${token}`);
      })
      .catch(() => setJoinUrl(null))
      .finally(() => setJoinUrlLoading(false));
  }, [group?.classId]);

  if (!user) return null;
  if (loading) return <p className="p-8">Loading...</p>;
  if (!group) return <p className="p-8">Group not found.</p>;

  const nextSession = group.nextSession;
  const dateStr = nextSession
    ? new Date(nextSession.scheduledAt).toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const copyJoinLink = () => {
    if (joinUrl) navigator.clipboard.writeText(joinUrl);
  };

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user) return;
    setInviteSubmitting(true);
    setInviteSuccess(false);
    try {
      await inviteToGroupByEmail(groupId, inviteEmail.trim(), user.id);
      setInviteSuccess(true);
      setInviteEmail("");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!user) return;
    setInvitingFriendId(friendId);
    try {
      await joinStudyGroup(groupId, friendId);
      refreshGroup();
    } finally {
      setInvitingFriendId(null);
    }
  };

  const friendsNotInGroup = friends.filter((f) => !memberIds.has(f.id));

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate || !sessionTime) return;
    const scheduledAt = new Date(`${sessionDate}T${sessionTime}`).toISOString();
    setSessionSubmitting(true);
    try {
      await createGroupSession(groupId, scheduledAt, sessionLocation.trim() || undefined);
      const updated = await getStudyGroup(groupId);
      setGroup(updated);
      setSessionDate("");
      setSessionTime("");
      setSessionLocation("");
    } finally {
      setSessionSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <Link href="/study-groups" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <ArrowLeft className="h-4 w-4" />
        Back to study groups
      </Link>
      <PageHeader
        title={group.name}
        description={group.class ? `${group.class.code ?? group.class.name}` : "General study group"}
      />
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Members ({group.memberCount ?? 0})
          </h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No members yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-2 dark:border-gray-800"
                >
                  <Avatar src={m.avatar} fallback={m.name} className="h-10 w-10" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{m.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleCreateSession} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Schedule a session
          </h3>
          <div className="flex flex-wrap gap-3">
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
            <Input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Location (optional)"
              value={sessionLocation}
              onChange={(e) => setSessionLocation(e.target.value)}
            />
            <Button type="submit" disabled={sessionSubmitting}>
              {sessionSubmitting ? "Adding..." : "Add session"}
            </Button>
          </div>
        </form>
        {dateStr && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Next session
            </h3>
            <p className="text-gray-900 dark:text-gray-50">{dateStr}</p>
            {group.nextSession?.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {group.nextSession.location}
              </p>
            )}
          </div>
        )}
        {group.classId && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Share this class
            </h3>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Share this link or QR code so classmates can join the class and study group.
            </p>
            {joinUrlLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : joinUrl ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800">
                  <QRCode value={joinUrl} size={128} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={joinUrl}
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copyJoinLink}>
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Could not load join link.</p>
            )}
          </div>
        )}

        <form onSubmit={handleInviteByEmail} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invite by email
          </h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Classmate's email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={inviteSubmitting}>
              {inviteSubmitting ? "Sending..." : "Invite"}
            </Button>
          </div>
          {inviteSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Invite sent! They can join when they sign up.
            </p>
          )}
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invite friends
          </h3>
          {friendsNotInGroup.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {friends.length === 0
                ? "Add friends first — they'll show up here."
                : "All your friends are already in this group."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {friendsNotInGroup.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={friend.avatar}
                      fallback={friend.name}
                      className="h-10 w-10"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {friend.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleInviteFriend(friend.id)}
                    disabled={invitingFriendId === friend.id}
                  >
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    {invitingFriendId === friend.id ? "Adding…" : "Invite"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
