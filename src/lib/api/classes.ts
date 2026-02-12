import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import type { Class } from "@/types/class";
import { MOCK_CLASSES } from "@/data/mock";

async function getClassesMock(): Promise<Class[]> {
  return MOCK_CLASSES;
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
