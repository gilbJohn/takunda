import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import { profileToUser } from "./supabase-helpers";
import type { User } from "@/types/user";
import { MOCK_USERS } from "@/data/mock";

export interface SearchUsersParams {
  query?: string;
  classIds?: string[];
  excludeUserId?: string;
}

async function getUsersMock(): Promise<User[]> {
  return MOCK_USERS;
}

async function getUsersSupabase(): Promise<User[]> {
  if (!supabase) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, phone, school, major, onboarding_completed");
  if (!profiles) return [];

  const { data: enrollments } = await supabase.from("user_classes").select("user_id, class_id");
  const classIdsByUser = (enrollments ?? []).reduce<Record<string, string[]>>((acc, e) => {
    if (!acc[e.user_id]) acc[e.user_id] = [];
    acc[e.user_id].push(e.class_id);
    return acc;
  }, {});

  return profiles.map((p) => profileToUser(p, classIdsByUser[p.id] ?? []));
}

async function getUsersApi(): Promise<User[]> {
  return apiClient.get<User[]>("/users");
}

export async function getUsers(): Promise<User[]> {
  if (API_CONFIG.useSupabase) return getUsersSupabase();
  if (API_CONFIG.useMock) return getUsersMock();
  return getUsersApi();
}

async function getUserMock(id: string): Promise<User | null> {
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}

async function getUserSupabase(id: string): Promise<User | null> {
  if (!supabase) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, phone, school, major, onboarding_completed")
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;

  const { data: enrollments } = await supabase
    .from("user_classes")
    .select("class_id")
    .eq("user_id", id);
  const classIds = (enrollments ?? []).map((e) => e.class_id);

  return profileToUser(profile, classIds);
}

async function getUserApi(id: string): Promise<User | null> {
  try {
    return await apiClient.get<User>(`/users/${id}`);
  } catch {
    return null;
  }
}

export async function getUser(id: string): Promise<User | null> {
  if (API_CONFIG.useSupabase) return getUserSupabase(id);
  if (API_CONFIG.useMock) return getUserMock(id);
  return getUserApi(id);
}

async function searchUsersMock(params: SearchUsersParams): Promise<User[]> {
  let filtered = MOCK_USERS.filter((u) => u.id !== params.excludeUserId);

  if (params.query?.trim()) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  if (params.classIds?.length) {
    filtered = filtered.filter((u) =>
      params.classIds!.some((cid) => u.classIds.includes(cid))
    );
  }

  return filtered;
}

async function searchUsersSupabase(params: SearchUsersParams): Promise<User[]> {
  const all = await getUsersSupabase();
  let filtered = all.filter((u) => u.id !== params.excludeUserId);

  if (params.query?.trim()) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  if (params.classIds?.length) {
    filtered = filtered.filter((u) =>
      params.classIds!.some((cid) => u.classIds.includes(cid))
    );
  }

  return filtered;
}

async function searchUsersApi(params: SearchUsersParams): Promise<User[]> {
  const searchParams: Record<string, string> = {};
  if (params.query) searchParams.q = params.query;
  if (params.classIds?.length) searchParams.classIds = params.classIds.join(",");
  if (params.excludeUserId) searchParams.exclude = params.excludeUserId;

  return apiClient.get<User[]>("/users/search", { params: searchParams });
}

export async function searchUsers(params: SearchUsersParams): Promise<User[]> {
  if (API_CONFIG.useSupabase) return searchUsersSupabase(params);
  if (API_CONFIG.useMock) return searchUsersMock(params);
  return searchUsersApi(params);
}

// --- Profile update & class enrollment ---

export interface UpdateProfileInput {
  userId: string;
  phone?: string;
  school?: string;
  major?: string;
  classIds?: string[];
  onboardingCompleted?: boolean;
  /** For mock mode: base user when not in MOCK_USERS (e.g. newly signed up) */
  _currentUser?: User;
}

async function updateProfileMock(
  input: UpdateProfileInput
): Promise<User | null> {
  const existing =
    MOCK_USERS.find((u) => u.id === input.userId) ?? input._currentUser ?? null;
  if (!existing) return null;
  const updated: User = {
    ...existing,
    phone: input.phone ?? existing.phone,
    school: input.school ?? existing.school,
    major: input.major ?? existing.major,
    classIds: input.classIds ?? existing.classIds,
    onboardingCompleted: input.onboardingCompleted ?? existing.onboardingCompleted,
  };
  return updated;
}

async function updateProfileSupabase(
  input: UpdateProfileInput
): Promise<User | null> {
  if (!supabase) return null;
  const userId = input.userId;

  const { _currentUser, ...payload } = input;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      ...(payload.phone !== undefined && { phone: payload.phone || null }),
      ...(payload.school !== undefined && { school: payload.school || null }),
      ...(payload.major !== undefined && { major: payload.major || null }),
      ...(payload.onboardingCompleted !== undefined && {
        onboarding_completed: payload.onboardingCompleted,
      }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  if (payload.classIds !== undefined) {
    await supabase.from("user_classes").delete().eq("user_id", userId);
    if (payload.classIds.length > 0) {
      const { error: enrollError } = await supabase.from("user_classes").insert(
        payload.classIds.map((class_id) => ({ user_id: userId, class_id }))
      );
      if (enrollError) throw new Error(enrollError.message);
    }
  }

  return getUser(userId);
}

async function updateProfileApi(input: UpdateProfileInput): Promise<User | null> {
  const { _currentUser, ...payload } = input;
  const res = await apiClient.patch<User>(`/users/${input.userId}`, {
    phone: payload.phone,
    school: payload.school,
    major: payload.major,
    classIds: payload.classIds,
    onboardingCompleted: payload.onboardingCompleted,
  });
  return res ?? null;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<User | null> {
  if (API_CONFIG.useSupabase) return updateProfileSupabase(input);
  if (API_CONFIG.useMock) return updateProfileMock(input);
  return updateProfileApi(input);
}
