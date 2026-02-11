"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useClasses } from "@/hooks/use-classes";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MyClassesSection } from "@/components/profile/my-classes-section";
import { PageHeader } from "@/components/shared/page-header";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { classes: allClasses } = useClasses();

  if (!user) return null;

  const classes = user.classIds
    .map((id) => allClasses.find((c) => c.id === id))
    .filter((c): c is (typeof allClasses)[number] => c != null);

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader title="Profile" description="Your profile and classes" />
      <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <ProfileHeader user={user} showEmail />
        <MyClassesSection classes={classes} />
      </div>
    </div>
  );
}
