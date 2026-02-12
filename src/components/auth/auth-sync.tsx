"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { API_CONFIG } from "@/lib/config/api";
import { profileToUser } from "@/lib/api/supabase-helpers";

/**
 * Syncs Supabase session to auth store on mount (e.g. after page refresh).
 * Ensures the auth store has the current user when Supabase session exists.
 */
export function AuthSync() {
  useEffect(() => {
    const client = supabase;
    if (!API_CONFIG.useSupabase || !client) return;

    const syncSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        useAuthStore.setState({ user: null, isLoggedIn: false });
        return;
      }

      let { data: profile } = await client
        .from("profiles")
        .select("id, name, email, avatar, phone, school, major, onboarding_completed")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        await new Promise((r) => setTimeout(r, 500));
        const res = await client
          .from("profiles")
          .select("id, name, email, avatar, phone, school, major, onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();
        profile = res.data;
      }

      const profileData = profile ?? {
        id: session.user.id,
        name: session.user.user_metadata?.name ?? session.user.email?.split("@")[0] ?? "User",
        email: session.user.email ?? "",
        avatar: null,
        phone: null,
        school: null,
        major: null,
        onboarding_completed: false,
      };

      const { data: enrollments } = await client
        .from("user_classes")
        .select("class_id")
        .eq("user_id", session.user.id);
      const classIds = (enrollments ?? []).map((e) => e.class_id);

      const user = profileToUser(profileData, classIds);
      useAuthStore.setState({ user, isLoggedIn: true });
    };

    syncSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          useAuthStore.setState({ user: null, isLoggedIn: false });
        } else if (session?.user) {
          await syncSession();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
