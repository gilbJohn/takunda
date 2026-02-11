"use client";

import { useState, useEffect, useMemo } from "react";
import type { User } from "@/types/user";
import { MOCK_USERS } from "@/data/mock";

export interface UseUserSearchOptions {
  currentUserId?: string;
  searchQuery?: string;
  classIds?: string[];
}

export function useUserSearch({
  currentUserId,
  searchQuery = "",
  classIds = [],
}: UseUserSearchOptions) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const results = useMemo(() => {
    let filtered = MOCK_USERS.filter((u) => u.id !== currentUserId);

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (classIds.length > 0) {
      filtered = filtered.filter((u) =>
        classIds.some((cid) => u.classIds.includes(cid))
      );
    }

    return filtered;
  }, [currentUserId, debouncedQuery, classIds]);

  return results;
}
