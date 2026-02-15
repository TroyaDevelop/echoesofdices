import type { UserFlags } from '../utils/permissions';

export type AuthUser = {
  userId: number;
  login: string;
  role: string;
  flags: UserFlags;
};
