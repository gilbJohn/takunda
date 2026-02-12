/**
 * API layer - single entry point for all backend communication.
 *
 * When NEXT_PUBLIC_API_URL is set, all functions use the real backend.
 * When unset, mock implementations are used (no backend required).
 */
export { login, signup, logout } from "./auth";
export type { LoginResult, SignupInput } from "./auth";

export { getUsers, getUser, searchUsers, updateProfile } from "./users";
export type { SearchUsersParams, UpdateProfileInput } from "./users";

export {
  getFriends,
  getPendingInvites,
  getSentInvites,
  sendFriendInvite,
  acceptFriendInvite,
  declineFriendInvite,
  getFriendSuggestions,
} from "./friends";
export type { FriendInvite } from "@/types/friend";

export { getClasses, searchClasses, createClass } from "./classes";
export type { CreateClassInput } from "./classes";

export {
  getMyGroups,
  getDiscoverableGroups,
  createStudyGroup,
  joinStudyGroup,
  ensureStudyGroupsForClasses,
  getStudyGroup,
  getGroupMemberIds,
  getGroupMembers,
  getGroupPendingUserInviteIds,
  getOrCreateClassJoinToken,
  joinClassByToken,
  getUpcomingSessions,
  createGroupSession,
  inviteToGroupByEmail,
  inviteFriendToGroup,
  getStudyGroupInvitesForUser,
  acceptStudyGroupInvite,
  declineStudyGroupInvite,
} from "./study-groups";

export { getDecks, getDeck, getExploreDecks, createDeck } from "./decks";
