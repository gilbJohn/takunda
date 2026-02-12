export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  school?: string;
  major?: string;
  onboardingCompleted?: boolean;
  classIds: string[];
}
