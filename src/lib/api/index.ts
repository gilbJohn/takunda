/**
 * API layer - single entry point for all backend communication.
 *
 * When NEXT_PUBLIC_API_URL is set, all functions use the real backend.
 * When unset, mock implementations are used (no backend required).
 */
export { login, signup, logout } from "./auth";
export type { LoginResult, SignupInput } from "./auth";

export { getUsers, getUser, searchUsers } from "./users";
export type { SearchUsersParams } from "./users";

export { getClasses } from "./classes";

export { getDecks, getDeck, createDeck } from "./decks";
