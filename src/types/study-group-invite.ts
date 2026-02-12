import type { User } from "./user";
import type { StudyGroup } from "./study-group";

export interface StudyGroupUserInvite {
  id: string;
  groupId: string;
  recipientId: string;
  invitedById: string;
  createdAt: string;
  group?: StudyGroup;
  inviter?: User;
}
