"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFriends,
  getPendingInvites,
  getSentInvites,
  sendFriendInvite,
  acceptFriendInvite,
  declineFriendInvite,
  getFriendSuggestions,
} from "@/lib/api";
import type { User } from "@/types/user";
import type { FriendInvite } from "@/types/friend";

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<FriendInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<FriendInvite[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [f, p, s, g] = await Promise.all([
        getFriends(userId),
        getPendingInvites(userId),
        getSentInvites(userId),
        getFriendSuggestions(userId),
      ]);
      setFriends(f);
      setPendingInvites(p);
      setSentInvites(s);
      setSuggestions(g);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSendInvite = useCallback(
    async (recipientId: string) => {
      if (!userId) return;
      await sendFriendInvite(userId, recipientId);
      await refresh();
    },
    [userId, refresh]
  );

  const handleAcceptInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await acceptFriendInvite(inviteId, userId);
      await refresh();
    },
    [userId, refresh]
  );

  const handleDeclineInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await declineFriendInvite(inviteId, userId);
      await refresh();
    },
    [userId, refresh]
  );

  return {
    friends,
    pendingInvites,
    sentInvites,
    suggestions,
    isLoading,
    refresh,
    sendInvite: handleSendInvite,
    acceptInvite: handleAcceptInvite,
    declineInvite: handleDeclineInvite,
  };
}
