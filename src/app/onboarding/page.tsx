"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { useClasses } from "@/hooks/use-classes";
import { updateProfile } from "@/lib/api";
import { GraduationCap, Phone, Users } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { classes, isLoading: classesLoading } = useClasses();

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [university, setUniversity] = useState(user?.school ?? "");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    user?.classIds ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleClass = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateProfile({
        userId: user.id,
        phone: phone.trim() || undefined,
        school: university.trim() || undefined,
        classIds: selectedClassIds,
        onboardingCompleted: true,
        _currentUser: user,
      });
      if (updated) {
        setUser(updated);
        router.replace("/dashboard");
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Complete your profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connect with classmates—add your contact info, school, and classes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Phone className="h-4 w-4" />
            Phone number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* University */}
        <div className="space-y-2">
          <label
            htmlFor="university"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <GraduationCap className="h-4 w-4" />
            University
          </label>
          <Input
            id="university"
            type="text"
            placeholder="e.g. State University"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          />
        </div>

        {/* Classes */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users className="h-4 w-4" />
            Your classes
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select all classes you&apos;re currently taking
          </p>
          {classesLoading ? (
            <p className="text-sm text-gray-500">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No classes available yet. You can add them from your profile later.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedClassIds.includes(cls.id)
                      ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {cls.code ?? cls.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Complete setup"}
        </Button>
      </form>
    </div>
  );
}
