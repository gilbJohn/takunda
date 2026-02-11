import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
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

async function getUsersApi(): Promise<User[]> {
  return apiClient.get<User[]>("/users");
}

export async function getUsers(): Promise<User[]> {
  if (API_CONFIG.useMock) return getUsersMock();
  return getUsersApi();
}

async function getUserMock(id: string): Promise<User | null> {
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}

async function getUserApi(id: string): Promise<User | null> {
  try {
    return await apiClient.get<User>(`/users/${id}`);
  } catch {
    return null;
  }
}

export async function getUser(id: string): Promise<User | null> {
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

async function searchUsersApi(params: SearchUsersParams): Promise<User[]> {
  const searchParams: Record<string, string> = {};
  if (params.query) searchParams.q = params.query;
  if (params.classIds?.length) searchParams.classIds = params.classIds.join(",");
  if (params.excludeUserId) searchParams.exclude = params.excludeUserId;

  return apiClient.get<User[]>("/users/search", { params: searchParams });
}

export async function searchUsers(params: SearchUsersParams): Promise<User[]> {
  if (API_CONFIG.useMock) return searchUsersMock(params);
  return searchUsersApi(params);
}
