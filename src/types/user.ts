export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  school?: string;
  major?: string;
  classIds: string[];
}
