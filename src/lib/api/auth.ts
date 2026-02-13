import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import { profileToUser } from "./supabase-helpers";
import type { User } from "@/types/user";
import { MOCK_USERS } from "@/data/mock";

export interface LoginResult {
  user: User;
  token?: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

async function loginMock(email: string, password: string): Promise<LoginResult | null> {
  const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (found && password === "password") {
    return { user: found };
  }
  return null;
}

async function loginSupabase(
  email: string,
  password: string
): Promise<LoginResult | null> {
  if (!supabase) return null;
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  if (!authData.user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, phone, school, major, onboarding_completed")
    .eq("id", authData.user.id)
    .maybeSingle();

  // Retry once if profile not found (trigger may be delayed)
  if (!profile) {
    await new Promise((r) => setTimeout(r, 500));
    const res = await supabase
      .from("profiles")
      .select("id, name, email, avatar, phone, school, major, onboarding_completed")
      .eq("id", authData.user.id)
      .maybeSingle();
    profile = res.data;
  }

  const profileData = profile ?? {
    id: authData.user.id,
    name:
      authData.user.user_metadata?.name ?? authData.user.email?.split("@")[0] ?? "User",
    email: authData.user.email ?? "",
    avatar: null,
    phone: null,
    school: null,
    major: null,
    onboarding_completed: false,
  };

  const { data: enrollments } = await supabase
    .from("user_classes")
    .select("class_id")
    .eq("user_id", authData.user.id);
  const classIds = (enrollments ?? []).map((e) => e.class_id);

  return {
    user: profileToUser(profileData, classIds),
    token: authData.session?.access_token,
  };
}

async function loginApi(email: string, password: string): Promise<LoginResult | null> {
  const res = await apiClient.post<{ user: User; token: string }>("/auth/login", {
    email,
    password,
  });
  if (res?.user) {
    if (res.token && typeof window !== "undefined") {
      localStorage.setItem("takunda-auth-token", res.token);
    }
    return { user: res.user, token: res.token };
  }
  return null;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult | null> {
  if (API_CONFIG.useSupabase) return loginSupabase(email, password);
  if (API_CONFIG.useMock) return loginMock(email, password);
  return loginApi(email, password);
}

async function signupMock(input: SignupInput): Promise<LoginResult> {
  const user: User = {
    id: `user-${Date.now()}`,
    name: input.name,
    email: input.email,
    classIds: [],
  };
  return { user };
}

async function signupSupabase(input: SignupInput): Promise<LoginResult> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data: authData, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name } },
  });
  if (error) throw new Error(error.message);
  if (!authData.user) throw new Error("Signup failed");

  // Trigger creates profile; fetch it (may need short delay for trigger)
  await new Promise((r) => setTimeout(r, 500));
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, phone, school, major, onboarding_completed")
    .eq("id", authData.user.id)
    .maybeSingle();

  const user = profile
    ? profileToUser(profile, [])
    : {
        id: authData.user.id,
        name: input.name,
        email: input.email,
        onboardingCompleted: false,
        classIds: [],
      };

  return {
    user,
    token: authData.session?.access_token,
  };
}

async function signupApi(input: SignupInput): Promise<LoginResult> {
  const res = await apiClient.post<{ user: User; token: string }>("/auth/signup", input);
  if (res?.token && typeof window !== "undefined") {
    localStorage.setItem("takunda-auth-token", res.token);
  }
  return { user: res.user, token: res.token };
}

export async function signup(input: SignupInput): Promise<LoginResult> {
  if (API_CONFIG.useSupabase) return signupSupabase(input);
  if (API_CONFIG.useMock) return signupMock(input);
  return signupApi(input);
}

export async function logout(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem("takunda-auth-token");
  }
}
