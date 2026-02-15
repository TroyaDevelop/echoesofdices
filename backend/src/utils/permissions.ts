export type UserFlags = {
  admin: boolean;
  editor: boolean;
  master: boolean;
};

export type UserFlagKey = keyof UserFlags;

const toBool = (value: any) => Number(value) === 1 || value === true || String(value).toLowerCase() === 'true';

export function extractUserFlags(user: any): UserFlags {
  return {
    admin: toBool(user?.flag_admin ?? user?.flags?.admin),
    editor: toBool(user?.flag_editor ?? user?.flags?.editor),
    master: toBool(user?.flag_master ?? user?.flags?.master),
  };
}

export function hasFlag(user: any, flag: UserFlagKey): boolean {
  const flags = extractUserFlags(user);
  return Boolean(flags[flag]);
}

export function hasAnyFlag(user: any, flags: UserFlagKey[]): boolean {
  return flags.some((flag) => hasFlag(user, flag));
}

export function canAccessAdminPanel(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'editor', 'master']);
}

export function canManageUsers(user: any): boolean {
  return hasFlag(user, 'admin');
}

export function canManageNews(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'editor']);
}

export function canManageMarket(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'editor']);
}

export function canManageCompendium(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'editor', 'master']);
}

export function canManageScreen(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'master']);
}

export function canManageArticlesAndLore(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'master']);
}

export function canViewHiddenBestiary(user: any): boolean {
  return hasAnyFlag(user, ['admin', 'master']);
}
