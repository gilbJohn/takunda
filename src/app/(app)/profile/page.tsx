"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MyClassesSection } from "@/components/profile/my-classes-section";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_CLASSES } from "@/data/mock";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const classes = user.classIds
    .map((id) => MOCK_CLASSES.find((c) => c.id === id))
    .filter(Boolean) as typeof MOCK_CLASSES;

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
