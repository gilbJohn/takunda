import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import type { Class } from "@/types/class";
import { MOCK_CLASSES } from "@/data/mock";

async function getClassesMock(): Promise<Class[]> {
  return MOCK_CLASSES;
}

async function getClassesApi(): Promise<Class[]> {
  return apiClient.get<Class[]>("/classes");
}

export async function getClasses(): Promise<Class[]> {
  if (API_CONFIG.useMock) return getClassesMock();
  return getClassesApi();
}
