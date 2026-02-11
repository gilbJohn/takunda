"use client";

import { useState, useEffect } from "react";
import type { Class } from "@/types/class";
import { getClasses } from "@/lib/api";

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { classes, isLoading };
}
