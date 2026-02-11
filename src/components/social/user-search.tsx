"use client";

import { Input } from "@/components/ui/input";
import { MOCK_CLASSES } from "@/data/mock";
import { Search } from "lucide-react";

export interface UserSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassIds: string[];
  onClassFilterChange: (ids: string[]) => void;
}

export function UserSearch({
  searchQuery,
  onSearchChange,
  selectedClassIds,
  onClassFilterChange,
}: UserSearchProps) {
  const toggleClass = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      onClassFilterChange(selectedClassIds.filter((id) => id !== classId));
    } else {
      onClassFilterChange([...selectedClassIds, classId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Filter by class:
        </span>
        {MOCK_CLASSES.map((cls) => (
          <button
            key={cls.id}
            type="button"
            onClick={() => toggleClass(cls.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedClassIds.includes(cls.id)
                ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {cls.code ?? cls.name}
          </button>
        ))}
      </div>
    </div>
  );
}
