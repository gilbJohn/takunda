import type { Class } from "./class";

export interface StudyGroup {
  id: string;
  name: string;
  classId?: string;
  createdBy?: string;
  memberCount?: number;
  nextSession?: StudyGroupSession;
  class?: Class;
}

export interface StudyGroupSession {
  id: string;
  groupId: string;
  scheduledAt: string;
  location?: string;
}
