import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
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

async function signupApi(input: SignupInput): Promise<LoginResult> {
  const res = await apiClient.post<{ user: User; token: string }>("/auth/signup", input);
  if (res?.token && typeof window !== "undefined") {
    localStorage.setItem("takunda-auth-token", res.token);
  }
  return { user: res.user, token: res.token };
}

export async function signup(input: SignupInput): Promise<LoginResult> {
  if (API_CONFIG.useMock) return signupMock(input);
  return signupApi(input);
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("takunda-auth-token");
  }
}
