import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { ClassBadge } from "./class-badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import type { Class } from "@/types/class";

export interface ProfileCardProps {
  user: User;
  classes: Class[];
  showViewProfile?: boolean;
}

export function ProfileCard({ user, classes, showViewProfile = true }: ProfileCardProps) {
  const displayClasses = classes.slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start gap-4">
        <Avatar src={user.avatar} fallback={user.name} className="h-12 w-12" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100">{user.name}</h3>
          {(user.school || user.major) && (
            <p className="text-sm text-slate-400">
              {[user.school, user.major].filter(Boolean).join(" • ")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {displayClasses.map((cls) => (
              <ClassBadge key={cls.id} name={cls.name} code={cls.code} />
            ))}
          </div>
          {showViewProfile && (
            <Link href={`/profile/${user.id}`} className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
