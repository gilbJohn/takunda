import type { User } from "./user";

export interface FriendInvite {
  id: string;
  senderId: string;
  recipientId: string;
  createdAt: string;
  sender?: User;
  recipient?: User;
}
