# Code Review: Bugs & Refactoring Opportunities

## Bugs Fixed

### 1. ProfileEditModal – stale form state
**File:** `src/components/profile/profile-edit-modal.tsx`

**Issue:** Form fields were initialized from `user` only on mount. When the modal was closed and reopened, or when `user` changed, the form kept old values.

**Fix:** Added a `useEffect` that resets form state when `open` or `user` changes.

### 2. Join page – double execution
**File:** `src/app/join/[token]/page.tsx`

**Issue:** The effect depended on `user`. When `user` changed (e.g. AuthSync updating the store), the effect could run again and trigger `joinClassByToken` twice.

**Fix:** Added a `joinStartedRef` guard so the join logic runs only once per mount.

---

## Potential Bugs to Review

### 3. Login redirect – sessionStorage key mismatch
**File:** `src/components/auth/login-form.tsx` (line 24)

The login form reads `takunda-join-redirect` from sessionStorage. The join page writes `/join/${token}`. Ensure the key is consistent and that the redirect logic handles the full path correctly (it does).

### 4. Friends API – silent failures
**File:** `src/lib/api/friends.ts`

`sendFriendInvite` can return `null` when the invite already exists or when the user is already a friend. The UI does not surface this. Consider returning a result object like `{ success: boolean; reason?: string }` so the UI can show feedback.

### 5. Supabase `declineFriendInvite` – filter chaining
**File:** `src/lib/api/friends.ts` (line 219)

```typescript
.delete().eq("id", inviteId).eq("recipient_id", userId)
```

Confirm that chaining `.eq()` on a delete builder applies an AND (this is standard for Supabase).

---

## Refactoring Opportunities

### 6. API layer – repeated Mock/Supabase/API branching
**Files:** `users.ts`, `classes.ts`, `friends.ts`, `study-groups.ts`, `auth.ts`, `decks.ts`

Pattern repeated everywhere:

```typescript
if (API_CONFIG.useSupabase) return fnSupabase(...);
if (API_CONFIG.useMock) return fnMock(...);
return fnApi(...);
```

**Suggestion:** Introduce a helper:

```typescript
function withBackend<T>(
  supabase: () => Promise<T>,
  mock: () => Promise<T>,
  api?: () => Promise<T>
) {
  if (API_CONFIG.useSupabase) return supabase();
  if (API_CONFIG.useMock) return mock();
  return api?.() ?? mock();
}
```

### 7. Friends API – N+1 queries
**File:** `src/lib/api/friends.ts`

`getFriendsSupabase` and `getFriendsMock` call `getUser(id)` in a loop for each friend. That leads to N+1 network calls.

**Suggestion:** Add a batch `getUsersByIds(ids: string[])` and use it in friends APIs.

### 8. Study groups – duplicated nextSession mapping
**File:** `src/lib/api/study-groups.ts`

The logic for mapping `nextSessionRow` to `nextSession` appears in `getMyGroupsSupabase`, `getStudyGroup`, and `getUpcomingSessions`.

**Suggestion:** Extract a helper:

```typescript
function toNextSession(row: { id: string; group_id: string; scheduled_at: string; location: string | null } | null) {
  if (!row) return undefined;
  return { id: row.id, groupId: row.group_id, scheduledAt: row.scheduled_at, location: row.location ?? undefined };
}
```

### 9. Hooks – shared data-fetching pattern
**Files:** `use-friends.ts`, `use-study-groups.ts`, `use-classes.ts`

Similar structure:

- `useState` for data and loading
- `useCallback` for refresh
- `useEffect` to fetch on mount
- Optional action handlers

**Suggestion:** Consider a generic `useAsyncData<T>` or switching to `useSWR` / `useQuery` for caching and deduplication.

### 10. Schema – redundant policy update
**File:** `supabase/schema.sql` (lines 260–262)

The block drops and recreates the `"Classes are viewable by everyone"` policy that was already created earlier. You can simplify to:

```sql
CREATE POLICY "Authenticated can create classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

and remove the redundant DROP/CREATE for the SELECT policy.

### 11. Study group detail – hardcoded `null` fallback
**File:** `src/app/(app)/study-groups/[groupId]/page.tsx` (line 89)

After `createGroupSession`, `getStudyGroup(groupId)` is called. If Supabase returns `null` (e.g. RLS), `setGroup(updated)` would set `group` to `null` and the UI would show “Group not found.” Add error handling or a fallback.

### 12. `useClasses` – lacks error handling
**File:** `src/hooks/use-classes.ts`

`refresh()` catches errors and sets `classes` to `[]`. A failed load is indistinguishable from “no classes.” Consider an `error` state and surfacing it in the UI.

---

## Summary

| Category             | Count |
|----------------------|-------|
| Bugs fixed           | 2     |
| Potential bugs       | 3     |
| Refactoring ideas    | 7     |
