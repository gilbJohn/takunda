"use client";

import { useState, useEffect, useCallback } from "react";
import type { Class } from "@/types/class";
import { getClasses } from "@/lib/api";

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getClasses()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { classes, isLoading, refresh };
}
