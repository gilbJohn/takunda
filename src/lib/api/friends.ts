import { API_CONFIG } from "@/lib/config/api";
import { supabase } from "@/lib/supabase/client";
import { profileToUser } from "./supabase-helpers";
import { getUser } from "./users";
import type { User } from "@/types/user";
import type { FriendInvite } from "@/types/friend";
import { MOCK_USERS } from "@/data/mock";

// Mock state (mutable for session - resets on refresh)
let mockFriendships: Array<{ user_id: string; friend_id: string }> = [
  { user_id: "user-1", friend_id: "user-2" }, // Alex and Sam are friends
];
let mockFriendInvites: Array<{ id: string; sender_id: string; recipient_id: string }> = [
  { id: "inv-1", sender_id: "user-3", recipient_id: "user-1" }, // Jordan invited Alex
];

function getFriendIdFromPair(
  userId: string,
  row: { user_id: string; friend_id: string }
): string {
  return row.user_id === userId ? row.friend_id : row.user_id;
}

async function getFriendsMock(userId: string): Promise<User[]> {
  const pairs = mockFriendships.filter(
    (r) => r.user_id === userId || r.friend_id === userId
  );
  const friendIds = pairs.map((r) => getFriendIdFromPair(userId, r));
  const users: User[] = [];
  for (const id of friendIds) {
    const u = MOCK_USERS.find((u) => u.id === id) ?? (await getUser(id));
    if (u) users.push(u);
  }
  return users;
}

async function getFriendsSupabase(userId: string): Promise<User[]> {
  if (!supabase) return [];
  const { data: rows } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
  if (!rows?.length) return [];
  const friendIds = rows.map((r) => getFriendIdFromPair(userId, r));
  const users: User[] = [];
  for (const id of friendIds) {
    const u = await getUser(id);
    if (u) users.push(u);
  }
  return users;
}

export async function getFriends(userId: string): Promise<User[]> {
  if (API_CONFIG.useSupabase) return getFriendsSupabase(userId);
  return getFriendsMock(userId);
}

async function getPendingInvitesMock(userId: string): Promise<FriendInvite[]> {
  const invites = mockFriendInvites.filter((i) => i.recipient_id === userId);
  const result: FriendInvite[] = [];
  for (const inv of invites) {
    const sender =
      MOCK_USERS.find((u) => u.id === inv.sender_id) ?? (await getUser(inv.sender_id));
    if (sender) {
      result.push({
        id: inv.id,
        senderId: inv.sender_id,
        recipientId: inv.recipient_id,
        createdAt: new Date().toISOString(),
        sender,
      });
    }
  }
  return result;
}

async function getPendingInvitesSupabase(userId: string): Promise<FriendInvite[]> {
  if (!supabase) return [];
  const { data: rows } = await supabase
    .from("friend_invites")
    .select("id, sender_id, recipient_id, created_at")
    .eq("recipient_id", userId);
  if (!rows?.length) return [];
  const result: FriendInvite[] = [];
  for (const row of rows) {
    const sender = await getUser(row.sender_id);
    if (sender) {
      result.push({
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        createdAt: row.created_at,
        sender,
      });
    }
  }
  return result;
}

export async function getPendingInvites(userId: string): Promise<FriendInvite[]> {
  if (API_CONFIG.useSupabase) return getPendingInvitesSupabase(userId);
  return getPendingInvitesMock(userId);
}

async function getSentInvitesMock(userId: string): Promise<FriendInvite[]> {
  const invites = mockFriendInvites.filter((i) => i.sender_id === userId);
  const result: FriendInvite[] = [];
  for (const inv of invites) {
    const recipient =
      MOCK_USERS.find((u) => u.id === inv.recipient_id) ??
      (await getUser(inv.recipient_id));
    if (recipient) {
      result.push({
        id: inv.id,
        senderId: inv.sender_id,
        recipientId: inv.recipient_id,
        createdAt: new Date().toISOString(),
        recipient,
      });
    }
  }
  return result;
}

async function getSentInvitesSupabase(userId: string): Promise<FriendInvite[]> {
  if (!supabase) return [];
  const { data: rows } = await supabase
    .from("friend_invites")
    .select("id, sender_id, recipient_id, created_at")
    .eq("sender_id", userId);
  if (!rows?.length) return [];
  const result: FriendInvite[] = [];
  for (const row of rows) {
    const recipient = await getUser(row.recipient_id);
    if (recipient) {
      result.push({
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        createdAt: row.created_at,
        recipient,
      });
    }
  }
  return result;
}

export async function getSentInvites(userId: string): Promise<FriendInvite[]> {
  if (API_CONFIG.useSupabase) return getSentInvitesSupabase(userId);
  return getSentInvitesMock(userId);
}

async function sendFriendInviteMock(
  senderId: string,
  recipientId: string
): Promise<FriendInvite | null> {
  if (senderId === recipientId) return null;
  const existing = mockFriendInvites.find(
    (i) =>
      (i.sender_id === senderId && i.recipient_id === recipientId) ||
      (i.sender_id === recipientId && i.recipient_id === senderId)
  );
  if (existing) return null;
  const alreadyFriends = mockFriendships.some(
    (f) =>
      (f.user_id === senderId && f.friend_id === recipientId) ||
      (f.user_id === recipientId && f.friend_id === senderId)
  );
  if (alreadyFriends) return null;
  const id = `inv-${Date.now()}`;
  mockFriendInvites.push({ id, sender_id: senderId, recipient_id: recipientId });
  const sender = MOCK_USERS.find((u) => u.id === senderId) ?? (await getUser(senderId));
  const recipient =
    MOCK_USERS.find((u) => u.id === recipientId) ?? (await getUser(recipientId));
  return {
    id,
    senderId,
    recipientId,
    createdAt: new Date().toISOString(),
    sender: sender ?? undefined,
    recipient: recipient ?? undefined,
  };
}

async function sendFriendInviteSupabase(
  senderId: string,
  recipientId: string
): Promise<FriendInvite | null> {
  if (!supabase) return null;
  if (senderId === recipientId) return null;
  const { data, error } = await supabase
    .from("friend_invites")
    .insert({ sender_id: senderId, recipient_id: recipientId })
    .select("id, sender_id, recipient_id, created_at")
    .single();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const sender = await getUser(data.sender_id);
  return {
    id: data.id,
    senderId: data.sender_id,
    recipientId: data.recipient_id,
    createdAt: data.created_at,
    sender: sender ?? undefined,
  };
}

export async function sendFriendInvite(
  senderId: string,
  recipientId: string
): Promise<FriendInvite | null> {
  if (API_CONFIG.useSupabase) return sendFriendInviteSupabase(senderId, recipientId);
  return sendFriendInviteMock(senderId, recipientId);
}

async function acceptFriendInviteMock(
  inviteId: string,
  userId: string
): Promise<boolean> {
  const inv = mockFriendInvites.find(
    (i) => i.id === inviteId && i.recipient_id === userId
  );
  if (!inv) return false;
  mockFriendInvites = mockFriendInvites.filter((i) => i.id !== inviteId);
  const [u1, u2] =
    inv.sender_id < inv.recipient_id
      ? [inv.sender_id, inv.recipient_id]
      : [inv.recipient_id, inv.sender_id];
  mockFriendships.push({ user_id: u1, friend_id: u2 });
  return true;
}

async function acceptFriendInviteSupabase(
  inviteId: string,
  userId: string
): Promise<boolean> {
  if (!supabase) return false;
  const { data: inv } = await supabase
    .from("friend_invites")
    .select("sender_id, recipient_id")
    .eq("id", inviteId)
    .eq("recipient_id", userId)
    .single();
  if (!inv) return false;
  const { error: delErr } = await supabase
    .from("friend_invites")
    .delete()
    .eq("id", inviteId);
  if (delErr) throw new Error(delErr.message);
  const [u1, u2] =
    inv.sender_id < inv.recipient_id
      ? [inv.sender_id, inv.recipient_id]
      : [inv.recipient_id, inv.sender_id];
  const { error: insErr } = await supabase
    .from("friendships")
    .insert({ user_id: u1, friend_id: u2 });
  if (insErr) throw new Error(insErr.message);
  return true;
}

export async function acceptFriendInvite(
  inviteId: string,
  userId: string
): Promise<boolean> {
  if (API_CONFIG.useSupabase) return acceptFriendInviteSupabase(inviteId, userId);
  return acceptFriendInviteMock(inviteId, userId);
}

async function declineFriendInviteMock(
  inviteId: string,
  userId: string
): Promise<boolean> {
  const inv = mockFriendInvites.find(
    (i) => i.id === inviteId && i.recipient_id === userId
  );
  if (!inv) return false;
  mockFriendInvites = mockFriendInvites.filter((i) => i.id !== inviteId);
  return true;
}

async function declineFriendInviteSupabase(
  inviteId: string,
  userId: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("friend_invites")
    .delete()
    .eq("id", inviteId)
    .eq("recipient_id", userId);
  if (error) throw new Error(error.message);
  return true;
}

export async function declineFriendInvite(
  inviteId: string,
  userId: string
): Promise<boolean> {
  if (API_CONFIG.useSupabase) return declineFriendInviteSupabase(inviteId, userId);
  return declineFriendInviteMock(inviteId, userId);
}

async function getFriendSuggestionsMock(userId: string): Promise<User[]> {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return [];
  const friendIds = new Set(
    mockFriendships
      .filter((r) => r.user_id === userId || r.friend_id === userId)
      .map((r) => getFriendIdFromPair(userId, r))
  );
  const invitedIds = new Set([
    ...mockFriendInvites.filter((i) => i.sender_id === userId).map((i) => i.recipient_id),
    ...mockFriendInvites.filter((i) => i.recipient_id === userId).map((i) => i.sender_id),
  ]);
  const exclude = new Set([...Array.from(friendIds), ...Array.from(invitedIds), userId]);
  const classmates = MOCK_USERS.filter((u) => {
    if (exclude.has(u.id)) return false;
    return user.classIds.some((cid) => u.classIds.includes(cid));
  });
  return classmates;
}

async function getFriendSuggestionsSupabase(userId: string): Promise<User[]> {
  if (!supabase) return [];
  const { data: enrollments } = await supabase
    .from("user_classes")
    .select("class_id")
    .eq("user_id", userId);
  const myClassIds = (enrollments ?? []).map((e) => e.class_id);
  if (myClassIds.length === 0) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, phone, school, major, onboarding_completed");
  const allUsers = (profiles ?? []).map((p) => profileToUser(p, []));
  const { data: ucAll } = await supabase.from("user_classes").select("user_id, class_id");
  const classIdsByUser = (ucAll ?? []).reduce<Record<string, string[]>>((acc, e) => {
    if (!acc[e.user_id]) acc[e.user_id] = [];
    acc[e.user_id].push(e.class_id);
    return acc;
  }, {});
  const usersWithClasses = allUsers.map((u) => ({
    ...u,
    classIds: classIdsByUser[u.id] ?? [],
  }));

  const { data: friendRows } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
  const friendIds = new Set(
    (friendRows ?? []).map((r) => getFriendIdFromPair(userId, r))
  );

  const { data: sentInvites } = await supabase
    .from("friend_invites")
    .select("recipient_id")
    .eq("sender_id", userId);
  const { data: recvInvites } = await supabase
    .from("friend_invites")
    .select("sender_id")
    .eq("recipient_id", userId);
  const invitedIds = new Set([
    ...(sentInvites ?? []).map((i) => i.recipient_id),
    ...(recvInvites ?? []).map((i) => i.sender_id),
  ]);

  const exclude = new Set([...Array.from(friendIds), ...Array.from(invitedIds), userId]);
  return usersWithClasses.filter((u) => {
    if (exclude.has(u.id)) return false;
    return u.classIds.some((cid) => myClassIds.includes(cid));
  });
}

export async function getFriendSuggestions(userId: string): Promise<User[]> {
  if (API_CONFIG.useSupabase) return getFriendSuggestionsSupabase(userId);
  return getFriendSuggestionsMock(userId);
}
