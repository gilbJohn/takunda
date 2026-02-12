import { API_CONFIG } from "@/lib/config/api";
import { supabase } from "@/lib/supabase/client";
import { getClasses } from "./classes";
import type { StudyGroup, StudyGroupSession } from "@/types/study-group";
import type { Class } from "@/types/class";
import { MOCK_CLASSES } from "@/data/mock";

// Mock state
let mockStudyGroups: Array<{
  id: string;
  name: string;
  class_id: string | null;
  created_by: string | null;
}> = [];
let mockStudyGroupMembers: Array<{ group_id: string; user_id: string }> = [];
let mockStudyGroupSessions: Array<{
  id: string;
  group_id: string;
  scheduled_at: string;
  location: string | null;
}> = [];

function toStudyGroup(
  row: { id: string; name: string; class_id: string | null; created_by: string | null },
  memberCount: number,
  nextSession?: StudyGroupSession,
  cls?: Class
): StudyGroup {
  return {
    id: row.id,
    name: row.name,
    classId: row.class_id ?? undefined,
    createdBy: row.created_by ?? undefined,
    memberCount,
    nextSession,
    class: cls,
  };
}

async function getMyGroupsMock(userId: string): Promise<StudyGroup[]> {
  const myGroupIds = mockStudyGroupMembers
    .filter((m) => m.user_id === userId)
    .map((m) => m.group_id);
  const groups: StudyGroup[] = [];
  for (const gid of myGroupIds) {
    const row = mockStudyGroups.find((g) => g.id === gid);
    if (!row) continue;
    const memberCount = mockStudyGroupMembers.filter((m) => m.group_id === gid).length;
    const nextSessionRow = mockStudyGroupSessions
      .filter((s) => s.group_id === gid && new Date(s.scheduled_at) > new Date())
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
    const nextSession = nextSessionRow
      ? { id: nextSessionRow.id, groupId: nextSessionRow.group_id, scheduledAt: nextSessionRow.scheduled_at, location: nextSessionRow.location ?? undefined }
      : undefined;
    const cls = row.class_id ? MOCK_CLASSES.find((c) => c.id === row.class_id) : undefined;
    groups.push(toStudyGroup(row, memberCount, nextSession, cls));
  }
  return groups;
}

async function getMyGroupsSupabase(userId: string): Promise<StudyGroup[]> {
  if (!supabase) return [];
  const { data: memberships } = await supabase
    .from("study_group_members")
    .select("group_id")
    .eq("user_id", userId);
  const groupIds = (memberships ?? []).map((m) => m.group_id);
  if (groupIds.length === 0) return [];

  const { data: groups } = await supabase
    .from("study_groups")
    .select("id, name, class_id, created_by")
    .in("id", groupIds);
  if (!groups?.length) return [];

  const allClasses = await getClasses();
  const result: StudyGroup[] = [];
  for (const row of groups) {
    const { count } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", row.id);
    const { data: sessionRows } = await supabase
      .from("study_group_sessions")
      .select("id, group_id, scheduled_at, location")
      .eq("group_id", row.id)
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1);
    const nextSessionRow = sessionRows?.[0];
    const nextSession = nextSessionRow
      ? { id: nextSessionRow.id, groupId: nextSessionRow.group_id, scheduledAt: nextSessionRow.scheduled_at, location: nextSessionRow.location ?? undefined }
      : undefined;
    const cls = row.class_id ? allClasses.find((c) => c.id === row.class_id) : undefined;
    result.push(toStudyGroup(row, count ?? 0, nextSession, cls));
  }
  return result;
}

export async function getMyGroups(userId: string): Promise<StudyGroup[]> {
  if (API_CONFIG.useSupabase) return getMyGroupsSupabase(userId);
  return getMyGroupsMock(userId);
}

async function getDiscoverableGroupsMock(userId: string): Promise<StudyGroup[]> {
  const myGroupIds = new Set(mockStudyGroupMembers.filter((m) => m.user_id === userId).map((m) => m.group_id));
  const myClassIds = new Set<string>(); // Would need user's classes - passed from caller
  const discoverable = mockStudyGroups.filter((g) => !myGroupIds.has(g.id));
  const groups: StudyGroup[] = [];
  for (const row of discoverable) {
    const memberCount = mockStudyGroupMembers.filter((m) => m.group_id === row.id).length;
    const cls = row.class_id ? MOCK_CLASSES.find((c) => c.id === row.class_id) : undefined;
    groups.push(toStudyGroup(row, memberCount, undefined, cls));
  }
  return groups;
}

async function getDiscoverableGroupsSupabase(userId: string): Promise<StudyGroup[]> {
  if (!supabase) return [];
  const { data: memberships } = await supabase
    .from("study_group_members")
    .select("group_id")
    .eq("user_id", userId);
  const myGroupIds = new Set((memberships ?? []).map((m) => m.group_id));

  const { data: allGroups } = await supabase
    .from("study_groups")
    .select("id, name, class_id, created_by");
  const discoverable = (allGroups ?? []).filter((g) => !myGroupIds.has(g.id));

  const allClasses = await getClasses();
  const result: StudyGroup[] = [];
  for (const row of discoverable) {
    const { count } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", row.id);
    const cls = row.class_id ? allClasses.find((c) => c.id === row.class_id) : undefined;
    result.push(toStudyGroup(row, count ?? 0, undefined, cls));
  }
  return result;
}

export async function getDiscoverableGroups(userId: string): Promise<StudyGroup[]> {
  if (API_CONFIG.useSupabase) return getDiscoverableGroupsSupabase(userId);
  return getDiscoverableGroupsMock(userId);
}

async function createStudyGroupMock(
  name: string,
  userId: string,
  classId?: string
): Promise<StudyGroup> {
  const id = `sg-${Date.now()}`;
  mockStudyGroups.push({ id, name, class_id: classId ?? null, created_by: userId });
  mockStudyGroupMembers.push({ group_id: id, user_id: userId });
  const cls = classId ? MOCK_CLASSES.find((c) => c.id === classId) : undefined;
  return toStudyGroup(
    { id, name, class_id: classId ?? null, created_by: userId },
    1,
    undefined,
    cls
  );
}

async function createStudyGroupSupabase(
  name: string,
  userId: string,
  classId?: string
): Promise<StudyGroup> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data: group, error: groupErr } = await supabase
    .from("study_groups")
    .insert({ name, class_id: classId ?? null, created_by: userId })
    .select("id, name, class_id, created_by")
    .single();
  if (groupErr) throw new Error(groupErr.message);
  const { error: memberErr } = await supabase
    .from("study_group_members")
    .insert({ group_id: group.id, user_id: userId });
  if (memberErr) throw new Error(memberErr.message);
  const allClasses = await getClasses();
  const cls = group.class_id ? allClasses.find((c) => c.id === group.class_id) : undefined;
  return toStudyGroup(group, 1, undefined, cls);
}

export async function createStudyGroup(
  name: string,
  userId: string,
  classId?: string
): Promise<StudyGroup> {
  if (API_CONFIG.useSupabase) return createStudyGroupSupabase(name, userId, classId);
  return createStudyGroupMock(name, userId, classId);
}

async function joinStudyGroupMock(groupId: string, userId: string): Promise<boolean> {
  if (mockStudyGroupMembers.some((m) => m.group_id === groupId && m.user_id === userId)) return true;
  mockStudyGroupMembers.push({ group_id: groupId, user_id: userId });
  return true;
}

async function joinStudyGroupSupabase(groupId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("study_group_members")
    .insert({ group_id: groupId, user_id: userId });
  if (error) throw new Error(error.message);
  return true;
}

export async function joinStudyGroup(groupId: string, userId: string): Promise<boolean> {
  if (API_CONFIG.useSupabase) return joinStudyGroupSupabase(groupId, userId);
  return joinStudyGroupMock(groupId, userId);
}

/** Ensures study groups exist for each class and user is a member. Only needed for mock mode (Supabase uses trigger). */
export async function ensureStudyGroupsForClasses(
  userId: string,
  classIds: string[]
): Promise<void> {
  if (API_CONFIG.useSupabase) return; // Trigger handles this
  if (API_CONFIG.useMock) {
    for (const classId of classIds) {
      const existing = mockStudyGroups.find((g) => g.class_id === classId);
      if (existing) {
        if (!mockStudyGroupMembers.some((m) => m.group_id === existing.id && m.user_id === userId)) {
          mockStudyGroupMembers.push({ group_id: existing.id, user_id: userId });
        }
      } else {
        const cls = MOCK_CLASSES.find((c) => c.id === classId);
        const id = `sg-${Date.now()}-${classId}`;
        mockStudyGroups.push({ id, name: cls?.name ?? "Study Group", class_id: classId, created_by: userId });
        mockStudyGroupMembers.push({ group_id: id, user_id: userId });
      }
    }
  }
}


export async function getStudyGroup(groupId: string): Promise<StudyGroup | null> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) return null;
    const { data: row } = await supabase
      .from("study_groups")
      .select("id, name, class_id, created_by")
      .eq("id", groupId)
      .single();
    if (!row) return null;
    const { count } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", row.id);
    const { data: sessionRows } = await supabase
      .from("study_group_sessions")
      .select("id, group_id, scheduled_at, location")
      .eq("group_id", row.id)
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1);
    const nextSessionRow = sessionRows?.[0];
    const nextSession = nextSessionRow
      ? { id: nextSessionRow.id, groupId: nextSessionRow.group_id, scheduledAt: nextSessionRow.scheduled_at, location: nextSessionRow.location ?? undefined }
      : undefined;
    const allClasses = await getClasses();
    const cls = row.class_id ? allClasses.find((c) => c.id === row.class_id) : undefined;
    return toStudyGroup(row, count ?? 0, nextSession, cls);
  }
  const row = mockStudyGroups.find((g) => g.id === groupId);
  if (!row) return null;
  const memberCount = mockStudyGroupMembers.filter((m) => m.group_id === groupId).length;
  const cls = row.class_id ? MOCK_CLASSES.find((c) => c.id === row.class_id) : undefined;
  return toStudyGroup(row, memberCount, undefined, cls);
}

// Mock class join tokens
const mockClassJoinTokens: Record<string, string> = {};

function randomToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function getOrCreateClassJoinToken(classId: string): Promise<string> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) throw new Error("Supabase not configured");
    const { data: existing } = await supabase
      .from("class_join_tokens")
      .select("token")
      .eq("class_id", classId)
      .maybeSingle();
    if (existing) return existing.token;
    const token = randomToken();
    await supabase.from("class_join_tokens").insert({ class_id: classId, token });
    return token;
  }
  if (mockClassJoinTokens[classId]) return mockClassJoinTokens[classId];
  const token = randomToken();
  mockClassJoinTokens[classId] = token;
  return token;
}

export async function joinClassByToken(token: string, userId: string): Promise<{ classId: string; groupId: string } | null> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) return null;
    const { data: row } = await supabase
      .from("class_join_tokens")
      .select("class_id")
      .eq("token", token)
      .maybeSingle();
    if (!row) return null;
    const classId = row.class_id;
    const { error: ucErr } = await supabase
      .from("user_classes")
      .insert({ user_id: userId, class_id: classId });
    if (ucErr) {
      if (ucErr.code === "23505") {
        const { data: sg } = await supabase
          .from("study_groups")
          .select("id")
          .eq("class_id", classId)
          .limit(1)
          .single();
        if (sg) return { classId, groupId: sg.id };
      }
      throw new Error(ucErr.message);
    }
    const { data: sg } = await supabase
      .from("study_groups")
      .select("id")
      .eq("class_id", classId)
      .limit(1)
      .single();
    if (!sg) return { classId, groupId: classId };
    return { classId, groupId: sg.id };
  }
  const classId = Object.entries(mockClassJoinTokens).find(([, t]) => t === token)?.[0];
  if (!classId) return null;
  const existingGroup = mockStudyGroups.find((g) => g.class_id === classId);
  if (!mockStudyGroupMembers.some((m) => m.group_id === (existingGroup?.id ?? "") && m.user_id === userId)) {
    if (existingGroup) {
      mockStudyGroupMembers.push({ group_id: existingGroup.id, user_id: userId });
    } else {
      const cls = MOCK_CLASSES.find((c) => c.id === classId);
      const id = `sg-${Date.now()}-${classId}`;
      mockStudyGroups.push({ id, name: cls?.name ?? "Study Group", class_id: classId, created_by: userId });
      mockStudyGroupMembers.push({ group_id: id, user_id: userId });
      return { classId, groupId: id };
    }
  }
  return { classId, groupId: existingGroup?.id ?? classId };
}

export async function getUpcomingSessions(userId: string): Promise<Array<StudyGroupSession & { groupName: string }>> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) return [];
    const { data: memberships } = await supabase
      .from("study_group_members")
      .select("group_id")
      .eq("user_id", userId);
    const groupIds = (memberships ?? []).map((m) => m.group_id);
    if (groupIds.length === 0) return [];

    const { data: sessions } = await supabase
      .from("study_group_sessions")
      .select("id, group_id, scheduled_at, location")
      .in("group_id", groupIds)
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(20);
    if (!sessions?.length) return [];

    const { data: groups } = await supabase
      .from("study_groups")
      .select("id, name")
      .in("id", [...new Set(sessions.map((s) => s.group_id))]);
    const nameByGroup = (groups ?? []).reduce<Record<string, string>>((acc, g) => {
      acc[g.id] = g.name;
      return acc;
    }, {});

    return sessions.map((s) => ({
      id: s.id,
      groupId: s.group_id,
      scheduledAt: s.scheduled_at,
      location: s.location ?? undefined,
      groupName: nameByGroup[s.group_id] ?? "Study Group",
    }));
  }
  const myGroupIds = mockStudyGroupMembers
    .filter((m) => m.user_id === userId)
    .map((m) => m.group_id);
  const upcoming = mockStudyGroupSessions
    .filter((s) => myGroupIds.includes(s.group_id) && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 20);
  return upcoming.map((s) => {
    const g = mockStudyGroups.find((gr) => gr.id === s.group_id);
    return {
      id: s.id,
      groupId: s.group_id,
      scheduledAt: s.scheduled_at,
      location: s.location ?? undefined,
      groupName: g?.name ?? "Study Group",
    };
  });
}

export async function createGroupSession(
  groupId: string,
  scheduledAt: string,
  location?: string
): Promise<StudyGroupSession | null> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("study_group_sessions")
      .insert({ group_id: groupId, scheduled_at: scheduledAt, location: location ?? null })
      .select("id, group_id, scheduled_at, location")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id, groupId: data.group_id, scheduledAt: data.scheduled_at, location: data.location ?? undefined };
  }
  const id = `sess-${Date.now()}`;
  mockStudyGroupSessions.push({ id, group_id: groupId, scheduled_at: scheduledAt, location: location ?? null });
  return { id, groupId, scheduledAt, location };
}

let mockStudyGroupInvites: Array<{ id: string; group_id: string; email: string; invited_by: string }> = [];

export async function inviteToGroupByEmail(
  groupId: string,
  email: string,
  userId: string
): Promise<boolean> {
  if (API_CONFIG.useSupabase) {
    if (!supabase) return false;
    const { error } = await supabase
      .from("study_group_invites")
      .insert({ group_id: groupId, email: email.trim().toLowerCase(), invited_by: userId });
    if (error) throw new Error(error.message);
    return true;
  }
  const id = `inv-${Date.now()}`;
  mockStudyGroupInvites.push({ id, group_id: groupId, email: email.trim().toLowerCase(), invited_by: userId });
  return true;
}
