/**
 * API Configuration
 *
 * Set NEXT_PUBLIC_API_URL to your backend URL to use the real API.
 * When unset or empty, the app uses mock data (no backend required).
 *
 * Example: NEXT_PUBLIC_API_URL=https://api.takunda.app
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const baseUrl = rawApiUrl.trim();

export const API_CONFIG = {
  baseUrl,
  useMock: !baseUrl,
} as const;

export const isApiEnabled = (): boolean => !API_CONFIG.useMock;
