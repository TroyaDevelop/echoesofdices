import { query } from '../../db/pool';

export async function findUserById(id: number) {
  const rows = await query<any[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function updateUserById(id: number, fields: Record<string, any>) {
  const setClauses = Object.keys(fields).map((k) => `\`${k}\` = ?`);
  const vals = [...Object.values(fields), id];
  await query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, vals);
}

export async function listUserAwards(userId: number) {
  return query<any[]>(
    'SELECT ua.id AS grant_id, ua.created_at AS granted_at, a.id, a.name, a.description, a.image_url, g.login AS granted_by_login FROM user_awards ua JOIN awards a ON a.id = ua.award_id LEFT JOIN users g ON g.id = ua.granted_by WHERE ua.user_id = ? ORDER BY ua.created_at DESC',
    [userId]
  );
}

export async function listMyAwards(userId: number) {
  return query<any[]>(
    'SELECT ua.id AS grant_id, ua.created_at AS granted_at, a.id, a.name, a.description, a.image_url FROM user_awards ua JOIN awards a ON a.id = ua.award_id WHERE ua.user_id = ? ORDER BY ua.created_at DESC',
    [userId]
  );
}

export async function listCharacterSheets(userId: number) {
  return query<any[]>('SELECT * FROM user_character_sheets WHERE user_id = ? ORDER BY id ASC', [userId]);
}

export async function countCharacterSheets(userId: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM user_character_sheets WHERE user_id = ?', [userId]);
  return Number(rows?.[0]?.c || 0);
}

export async function findCharacterSheetById(id: number) {
  const rows = await query<any[]>('SELECT * FROM user_character_sheets WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function findCharacterSheetForUser(userId: number, id: number) {
  const rows = await query<any[]>('SELECT * FROM user_character_sheets WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return rows && rows[0];
}

export async function createCharacterSheet(userId: number, fields: Record<string, any> = {}) {
  const cols = ['user_id', ...Object.keys(fields)];
  const vals = [userId, ...Object.values(fields)];
  const placeholders = cols.map(() => '?').join(', ');
  await query(`INSERT INTO user_character_sheets (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`, vals);
  const rows = await query<any[]>('SELECT * FROM user_character_sheets WHERE id = LAST_INSERT_ID() LIMIT 1', []);
  return rows && rows[0];
}

export async function updateCharacterSheet(userId: number, id: number, fields: Record<string, any>) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const setClauses = keys.map((k) => `\`${k}\` = ?`);
  const vals = [...Object.values(fields), id, userId];
  await query(`UPDATE user_character_sheets SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`, vals);
}

export async function deleteCharacterSheet(userId: number, id: number) {
  await query('DELETE FROM user_character_sheets WHERE id = ? AND user_id = ?', [id, userId]);
}
