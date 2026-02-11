"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MyClassesSection } from "@/components/profile/my-classes-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MOCK_USERS, MOCK_CLASSES } from "@/data/mock";

export default function ProfileByIdPage() {
  const params = useParams();
  const id = params.id as string;

  const user = MOCK_USERS.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title="User not found"
          description="This user could not be found."
        />
        <Link href="/find">
          <Button variant="outline">Back to Find</Button>
        </Link>
      </div>
    );
  }

  const classes = user.classIds
    .map((cid) => MOCK_CLASSES.find((c) => c.id === cid))
    .filter(Boolean) as typeof MOCK_CLASSES;

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader
        title={user.name}
        description="View profile"
      />
      <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <ProfileHeader user={user} showEmail={false} />
        <MyClassesSection classes={classes} title="Classes" />
      </div>
      <Link href="/find">
        <Button variant="outline">Back to Find</Button>
      </Link>
    </div>
  );
}
