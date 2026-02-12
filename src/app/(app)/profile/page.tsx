"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useClasses } from "@/hooks/use-classes";
import { updateProfile, createClass, ensureStudyGroupsForClasses } from "@/lib/api";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { MyClassesSection } from "@/components/profile/my-classes-section";
import { AddClassSection } from "@/components/profile/add-class-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { classes: allClasses, refresh: refreshClasses } = useClasses();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const classes = user.classIds
    .map((id) => allClasses.find((c) => c.id === id))
    .filter((c): c is (typeof allClasses)[number] => c != null);

  const handleSaveProfile = async (data: {
    name: string;
    phone?: string;
    school?: string;
    major?: string;
  }) => {
    const updated = await updateProfile({
      userId: user.id,
      name: data.name,
      phone: data.phone,
      school: data.school,
      major: data.major,
      _currentUser: user,
    });
    if (updated) setUser(updated);
  };

  const handleAddClass = async (classId: string) => {
    const newClassIds = Array.from(new Set([...user.classIds, classId]));
    const updated = await updateProfile({
      userId: user.id,
      classIds: newClassIds,
      _currentUser: user,
    });
    if (updated) {
      setUser(updated);
      await ensureStudyGroupsForClasses(updated.id, newClassIds);
    }
  };

  const handleCreateClass = async (name: string, code?: string) => {
    return createClass({ name, code });
  };

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader title="Profile" description="Your profile and classes" />
      <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between">
          <ProfileHeader user={user} showEmail showPhone />
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
        </div>

        <ProfileEditModal
          user={user}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleSaveProfile}
        />

        <MyClassesSection classes={classes} />

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Add class
          </h2>
          <AddClassSection
            allClasses={allClasses}
            userClassIds={user.classIds}
            onAddClass={handleAddClass}
            onCreateClass={handleCreateClass}
            onRefresh={refreshClasses}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Study groups
          </h2>
          <Link href="/study-groups">
            <Button variant="outline" className="gap-2">
              <UsersRound className="h-4 w-4" />
              View your study groups
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
