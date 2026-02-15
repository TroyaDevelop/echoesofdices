const toBool = (value) => value === true || value === 1 || String(value || '').toLowerCase() === 'true';

export const getUserFlags = (user) => ({
  admin: toBool(user?.flags?.admin ?? user?.flag_admin) || String(user?.role || '').toLowerCase() === 'admin',
  editor: toBool(user?.flags?.editor ?? user?.flag_editor) || String(user?.role || '').toLowerCase() === 'editor',
  master: toBool(user?.flags?.master ?? user?.flag_master) || String(user?.role || '').toLowerCase() === 'master',
});

export const hasAnyFlag = (user, allowed = []) => {
  const flags = getUserFlags(user);
  return allowed.some((name) => Boolean(flags[name]));
};

export const canAccessAdminPanel = (user) => hasAnyFlag(user, ['admin', 'editor', 'master']);
export const canManageUsers = (user) => hasAnyFlag(user, ['admin']);
export const canManageNews = (user) => hasAnyFlag(user, ['admin', 'editor']);
export const canManageMarket = (user) => hasAnyFlag(user, ['admin', 'editor']);
export const canManageCompendium = (user) => hasAnyFlag(user, ['admin', 'editor', 'master']);
export const canManageArticlesLore = (user) => hasAnyFlag(user, ['admin', 'master']);
export const canManageScreen = (user) => hasAnyFlag(user, ['admin', 'master']);
