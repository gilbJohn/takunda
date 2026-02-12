import { Avatar } from "@/components/shared/avatar";
import type { User } from "@/types/user";

export interface ProfileHeaderProps {
  user: User;
  showEmail?: boolean;
  showPhone?: boolean;
}

export function ProfileHeader({
  user,
  showEmail = true,
  showPhone = false,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <Avatar
        src={user.avatar}
        fallback={user.name}
        className="h-24 w-24"
      />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {user.name}
        </h1>
        {showEmail && (
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        )}
        {showPhone && user.phone && (
          <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>
        )}
        {(user.school || user.major) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {[user.school, user.major].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
}
