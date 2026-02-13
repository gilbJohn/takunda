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
    <div className="w-full max-w-lg space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
          Complete your profile
        </h1>
        <p className="text-sm text-slate-400">
          Connect with classmates—add your contact info, school, and classes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
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
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
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
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Users className="h-4 w-4" />
            Your classes
          </label>
          <p className="text-xs text-slate-400">
            Select all classes you&apos;re currently taking
          </p>
          {classesLoading ? (
            <p className="text-sm text-slate-400">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-slate-400">
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
                      ? "bg-emerald-600/15 text-emerald-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  }`}
                >
                  {cls.code ?? cls.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Complete setup"}
        </Button>
      </form>
    </div>
  );
}
