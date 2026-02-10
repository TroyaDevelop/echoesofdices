import { query } from '../../db/pool';

export async function findUserByLogin(login: string) {
  const rows = await query<any[]>('SELECT id, login, password, role, nickname FROM users WHERE login = ? LIMIT 1', [login]);
  return rows && rows[0];
}

export async function insertUser(login: string, password: string, role: string, nickname: string) {
  return query<any>('INSERT INTO users (login, password, role, nickname) VALUES (?, ?, ?, ?)', [login, password, role, nickname]);
}

export async function claimRegistrationKey(key: string) {
  return query<any>(
    'UPDATE registration_keys SET is_active = 0, used_at = NOW() WHERE reg_key = ? AND is_active = 1 AND used_at IS NULL',
    [key]
  );
}

export async function markRegistrationKeyUsed(userId: number, key: string) {
  return query<any>('UPDATE registration_keys SET used_by = ? WHERE reg_key = ? AND used_by IS NULL', [userId, key]);
}

export async function findUserLoginExists(login: string) {
  const rows = await query<any[]>('SELECT id FROM users WHERE login = ? LIMIT 1', [login]);
  return Boolean(rows && rows[0]);
}
