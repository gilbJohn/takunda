"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMyGroups,
  getDiscoverableGroups,
  createStudyGroup,
  joinStudyGroup,
  ensureStudyGroupsForClasses,
  getUpcomingSessions,
} from "@/lib/api";
import type { StudyGroup } from "@/types/study-group";

export function useStudyGroups(userId: string | undefined, userClassIds: string[] = []) {
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [discoverable, setDiscoverable] = useState<StudyGroup[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<
    Array<{
      id: string;
      groupId: string;
      scheduledAt: string;
      location?: string;
      groupName: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await ensureStudyGroupsForClasses(userId, userClassIds);
      const [mine, disc, sessions] = await Promise.all([
        getMyGroups(userId),
        getDiscoverableGroups(userId),
        getUpcomingSessions(userId),
      ]);
      setMyGroups(mine);
      setDiscoverable(disc);
      setUpcomingSessions(sessions);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userClassIds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateGroup = useCallback(
    async (name: string, classId?: string) => {
      if (!userId) return null;
      const group = await createStudyGroup(name, userId, classId);
      await refresh();
      return group;
    },
    [userId, refresh]
  );

  const handleJoinGroup = useCallback(
    async (groupId: string) => {
      if (!userId) return false;
      await joinStudyGroup(groupId, userId);
      await refresh();
      return true;
    },
    [userId, refresh]
  );

  return {
    myGroups,
    discoverable,
    upcomingSessions,
    isLoading,
    refresh,
    createGroup: handleCreateGroup,
    joinGroup: handleJoinGroup,
  };
}
