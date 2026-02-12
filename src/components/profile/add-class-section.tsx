"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Class } from "@/types/class";

export interface AddClassSectionProps {
  allClasses: Class[];
  userClassIds: string[];
  onAddClass: (classId: string) => Promise<void>;
  onCreateClass: (name: string, code?: string) => Promise<Class>;
  onRefresh: () => void;
}

export function AddClassSection({
  allClasses,
  userClassIds,
  onAddClass,
  onCreateClass,
  onRefresh,
}: AddClassSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filtered = searchQuery.trim()
    ? allClasses.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allClasses;

  const suggested = filtered.filter((c) => !userClassIds.includes(c.id));
  const exactMatch = searchQuery.trim()
    ? suggested.find(
        (c) =>
          c.name.toLowerCase() === searchQuery.toLowerCase().trim() ||
          c.code?.toLowerCase() === searchQuery.toLowerCase().trim()
      )
    : null;
  const noMatch = searchQuery.trim() && suggested.length === 0 && !exactMatch;

  const handleAdd = async (cls: Class) => {
    if (userClassIds.includes(cls.id)) return;
    setIsAdding(true);
    try {
      await onAddClass(cls.id);
      setSearchQuery("");
      onRefresh();
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    const name = searchQuery.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      const cls = await onCreateClass(name);
      await onAddClass(cls.id);
      setSearchQuery("");
      onRefresh();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search classes by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {searchQuery.trim() && (
        <div className="space-y-2">
          {suggested.slice(0, 5).map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="text-sm font-medium">
                {cls.code ? `${cls.code} - ` : ""}{cls.name}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAdd(cls)}
                disabled={isAdding}
              >
                Add
              </Button>
            </div>
          ))}
          {noMatch && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                No class found for &quot;{searchQuery}&quot;
              </span>
              <Button
                size="sm"
                onClick={handleCreateAndAdd}
                disabled={isAdding}
              >
                Add &quot;{searchQuery}&quot;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
