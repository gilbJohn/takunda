"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStudyGroupInvitesForUser,
  acceptStudyGroupInvite,
  declineStudyGroupInvite,
} from "@/lib/api";
import type { StudyGroupUserInvite } from "@/types/study-group-invite";

export function useStudyGroupInvites(userId: string | undefined) {
  const [invites, setInvites] = useState<StudyGroupUserInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!userId) {
      setInvites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getStudyGroupInvitesForUser(userId)
      .then(setInvites)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const accept = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await acceptStudyGroupInvite(inviteId, userId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    },
    [userId]
  );

  const decline = useCallback(
    async (inviteId: string) => {
      if (!userId) return;
      await declineStudyGroupInvite(inviteId, userId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    },
    [userId]
  );

  return { invites, loading, accept, decline, refresh };
}
