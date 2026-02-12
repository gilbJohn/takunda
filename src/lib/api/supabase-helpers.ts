import type { User } from "@/types/user";
import type { Class } from "@/types/class";

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  school: string | null;
  major: string | null;
  onboarding_completed?: boolean | null;
}

export function profileToUser(
  profile: ProfileRow,
  classIds: string[] = []
): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar ?? undefined,
    phone: profile.phone ?? undefined,
    school: profile.school ?? undefined,
    major: profile.major ?? undefined,
    onboardingCompleted: profile.onboarding_completed ?? false,
    classIds,
  };
}
