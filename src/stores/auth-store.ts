import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";
import { MOCK_USERS } from "@/data/mock";

const STORAGE_KEY = "takunda-auth";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (email: string, password: string) => {
        const found = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (found && password === "password") {
          set({ user: found, isLoggedIn: true });
          return true;
        }
        return false;
      },

      signup: (email: string, password: string, name: string) => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          classIds: [],
        };
        set({ user: newUser, isLoggedIn: true });
        return true;
      },

      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    { name: STORAGE_KEY }
  )
);
