import { query } from '../../db/pool';

export async function listUsers() {
  return query<any[]>('SELECT id, login, nickname, role, created_at, updated_at FROM users ORDER BY created_at DESC', []);
}

export async function findUserById(id: number) {
  const rows = await query<any[]>('SELECT id, role FROM users WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function deleteUserById(id: number) {
  return query<any>('DELETE FROM users WHERE id = ?', [id]);
}

export async function updateUserRole(id: number, role: string) {
  return query<any>('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

export async function createRegistrationKey(key: string, createdBy: number) {
  return query<any>('INSERT INTO registration_keys (reg_key, is_active, created_by) VALUES (?, 1, ?)', [key, createdBy]);
}

export async function listRegistrationKeys() {
  return query<any[]>(
    'SELECT rk.id, rk.reg_key AS `key`, rk.is_active, rk.created_at, rk.used_at, rk.used_by, u.login AS used_by_login, cu.login AS created_by_login FROM registration_keys rk LEFT JOIN users u ON rk.used_by = u.id LEFT JOIN users cu ON rk.created_by = cu.id ORDER BY rk.created_at DESC',
    []
  );
}

export async function listAwards() {
  return query<any[]>('SELECT * FROM awards ORDER BY created_at DESC', []);
}

export async function insertAward(name: string, description: string | null, imageUrl: string | null) {
  return query<any>('INSERT INTO awards (name, description, image_url) VALUES (?, ?, ?)', [name, description, imageUrl]);
}

export async function findAwardById(id: number) {
  const rows = await query<any[]>('SELECT * FROM awards WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function updateAward(id: number, name: string, description: string | null, imageUrl: string | null) {
  return query<any>('UPDATE awards SET name = ?, description = ?, image_url = ? WHERE id = ?', [name, description, imageUrl, id]);
}

export async function deleteAward(id: number) {
  return query<any>('DELETE FROM awards WHERE id = ?', [id]);
}

export async function grantAward(userId: number, awardId: number, grantedBy: number) {
  return query<any>('INSERT IGNORE INTO user_awards (user_id, award_id, granted_by) VALUES (?, ?, ?)', [userId, awardId, grantedBy]);
}

export async function revokeAward(userId: number, awardId: number) {
  return query<any>('DELETE FROM user_awards WHERE user_id = ? AND award_id = ?', [userId, awardId]);
}
