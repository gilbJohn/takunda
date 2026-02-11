"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MyClassesSection } from "@/components/profile/my-classes-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/api";
import { useClasses } from "@/hooks/use-classes";
import type { User } from "@/types/user";

export default function ProfileByIdPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const { classes: allClasses } = useClasses();

  useEffect(() => {
    getUser(id).then(setUser).catch(() => setUser(null));
  }, [id]);

  const classes = user
    ? user.classIds
        .map((cid) => allClasses.find((c) => c.id === cid))
        .filter((c): c is (typeof allClasses)[number] => c != null)
    : [];

  if (user === undefined) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
