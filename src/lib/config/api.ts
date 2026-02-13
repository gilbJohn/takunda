/**
 * API Configuration
 *
 * - Supabase: Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
 * - Custom API: Set NEXT_PUBLIC_API_URL to use a REST backend
 * - When neither is set, mock data is used
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const baseUrl = rawApiUrl.trim();

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  ""
).trim();

export const API_CONFIG = {
  baseUrl,
  useMock: !baseUrl && !(supabaseUrl && supabaseKey),
  useSupabase: !!(supabaseUrl && supabaseKey),
} as const;

export const isApiEnabled = (): boolean => !API_CONFIG.useMock;
