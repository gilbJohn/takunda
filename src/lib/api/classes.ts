import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import type { Class } from "@/types/class";
import { MOCK_CLASSES } from "@/data/mock";

let mockClasses: Class[] = [...MOCK_CLASSES];

async function getClassesMock(): Promise<Class[]> {
  return mockClasses;
}

async function getClassesSupabase(): Promise<Class[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("classes").select("id, name, code");
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code ?? undefined,
  }));
}

async function getClassesApi(): Promise<Class[]> {
  return apiClient.get<Class[]>("/classes");
}

export async function getClasses(): Promise<Class[]> {
  if (API_CONFIG.useSupabase) return getClassesSupabase();
  if (API_CONFIG.useMock) return getClassesMock();
  return getClassesApi();
}

export async function searchClasses(query: string): Promise<Class[]> {
  const all = await getClasses();
  if (!query.trim()) return all;
  const q = query.toLowerCase().trim();
  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.code?.toLowerCase().includes(q) ?? false)
  );
}

export interface CreateClassInput {
  name: string;
  code?: string;
}

async function createClassMock(input: CreateClassInput): Promise<Class> {
  const id = `class-${Date.now()}`;
  const cls: Class = { id, name: input.name, code: input.code };
  mockClasses.push(cls);
  return cls;
}

async function createClassSupabase(input: CreateClassInput): Promise<Class> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("classes")
    .insert({ name: input.name, code: input.code || null })
    .select("id, name, code")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, name: data.name, code: data.code ?? undefined };
}

async function createClassApi(input: CreateClassInput): Promise<Class> {
  const res = await apiClient.post<Class>("/classes", input);
  if (!res) throw new Error("Failed to create class");
  return res;
}

export async function createClass(input: CreateClassInput): Promise<Class> {
  if (API_CONFIG.useSupabase) return createClassSupabase(input);
  if (API_CONFIG.useMock) return createClassMock(input);
  return createClassApi(input);
}
