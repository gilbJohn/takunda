"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/user";
import { searchUsers } from "@/lib/api";

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
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    searchUsers({
      query: debouncedQuery || undefined,
      classIds: classIds.length ? classIds : undefined,
      excludeUserId: currentUserId,
    })
      .then((users) => {
        if (!cancelled) setResults(users);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId, debouncedQuery, classIds]);

  return { results, isLoading };
}
