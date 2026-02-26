import { query } from '../../db/pool';

export async function listBackgrounds() {
  return query<any[]>(
    'SELECT id, name, name_en, skill_proficiencies, tool_proficiencies, equipment, source, description, specialty_title, specialty_dice, specialty_table, feature_title, feature_description, personalization, created_at, updated_at FROM backgrounds ORDER BY name ASC',
    []
  );
}

export async function listBackgroundsAdmin() {
  return query<any[]>(
    'SELECT id, name, name_en, skill_proficiencies, tool_proficiencies, equipment, source, description, specialty_title, specialty_dice, specialty_table, feature_title, feature_description, personalization, created_at, updated_at FROM backgrounds ORDER BY name ASC',
    []
  );
}

export async function findBackgroundById(id: number) {
  const rows = await query<any[]>(
    'SELECT id, name, name_en, skill_proficiencies, tool_proficiencies, equipment, source, description, specialty_title, specialty_dice, specialty_table, feature_title, feature_description, personalization, created_at, updated_at FROM backgrounds WHERE id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function insertBackground(payload: any) {
  return query<any>(
    'INSERT INTO backgrounds (name, name_en, skill_proficiencies, tool_proficiencies, equipment, source, description, specialty_title, specialty_dice, specialty_table, feature_title, feature_description, personalization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      payload.name,
      payload.name_en,
      payload.skill_proficiencies,
      payload.tool_proficiencies,
      payload.equipment,
      payload.source,
      payload.description,
      payload.specialty_title,
      payload.specialty_dice,
      payload.specialty_table,
      payload.feature_title,
      payload.feature_description,
      payload.personalization,
    ]
  );
}

export async function updateBackground(id: number, payload: any) {
  return query<any>(
    'UPDATE backgrounds SET name = ?, name_en = ?, skill_proficiencies = ?, tool_proficiencies = ?, equipment = ?, source = ?, description = ?, specialty_title = ?, specialty_dice = ?, specialty_table = ?, feature_title = ?, feature_description = ?, personalization = ? WHERE id = ?',
    [
      payload.name,
      payload.name_en,
      payload.skill_proficiencies,
      payload.tool_proficiencies,
      payload.equipment,
      payload.source,
      payload.description,
      payload.specialty_title,
      payload.specialty_dice,
      payload.specialty_table,
      payload.feature_title,
      payload.feature_description,
      payload.personalization,
      id,
    ]
  );
}

export async function deleteBackground(id: number) {
  return query<any>('DELETE FROM backgrounds WHERE id = ?', [id]);
}

export async function getBackgroundLikeCount(id: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM background_likes WHERE background_id = ?', [id]);
  return Number(rows?.[0]?.c || 0);
}

export async function hasBackgroundLike(id: number, userId: number) {
  const rows = await query<any[]>('SELECT 1 AS ok FROM background_likes WHERE background_id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return Boolean(rows && rows[0]);
}

export async function listBackgroundComments(id: number) {
  return query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM background_comments c JOIN users u ON c.user_id = u.id WHERE c.background_id = ? ORDER BY c.created_at ASC, c.id ASC',
    [id]
  );
}

export async function insertBackgroundComment(backgroundId: number, userId: number, content: string) {
  return query<any>('INSERT INTO background_comments (background_id, user_id, content) VALUES (?, ?, ?)', [backgroundId, userId, content]);
}

export async function findBackgroundCommentById(id: number) {
  const rows = await query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM background_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function findBackgroundComment(backgroundId: number, commentId: number) {
  const rows = await query<any[]>('SELECT id FROM background_comments WHERE id = ? AND background_id = ? LIMIT 1', [commentId, backgroundId]);
  return rows && rows[0];
}

export async function deleteBackgroundComment(backgroundId: number, commentId: number) {
  return query<any>('DELETE FROM background_comments WHERE id = ? AND background_id = ? LIMIT 1', [commentId, backgroundId]);
}

export async function likeBackground(id: number, userId: number) {
  await query<any>('INSERT IGNORE INTO background_likes (background_id, user_id) VALUES (?, ?)', [id, userId]);
  return getBackgroundLikeCount(id);
}

export async function unlikeBackground(id: number, userId: number) {
  await query<any>('DELETE FROM background_likes WHERE background_id = ? AND user_id = ?', [id, userId]);
  return getBackgroundLikeCount(id);
}
