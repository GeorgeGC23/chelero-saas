export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface UserWorker {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
  active: boolean;
}
