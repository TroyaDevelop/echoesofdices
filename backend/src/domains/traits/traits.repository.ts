import { query } from '../../db/pool';

export async function listTraits() {
  return query<any[]>('SELECT id, name, name_en, requirements, source, description, description_eot, created_at, updated_at FROM traits ORDER BY name ASC', []);
}

export async function listTraitsAdmin() {
  return query<any[]>('SELECT id, name, name_en, requirements, source, description, description_eot, created_at, updated_at FROM traits ORDER BY name ASC', []);
}

export async function findTraitById(id: number) {
  const rows = await query<any[]>('SELECT id, name, name_en, requirements, source, description, description_eot, created_at, updated_at FROM traits WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function insertTrait(payload: any) {
  return query<any>('INSERT INTO traits (name, name_en, requirements, source, description, description_eot) VALUES (?, ?, ?, ?, ?, ?)', [
    payload.name,
    payload.name_en,
    payload.requirements,
    payload.source,
    payload.description,
    payload.description_eot,
  ]);
}

export async function updateTrait(id: number, payload: any) {
  return query<any>('UPDATE traits SET name = ?, name_en = ?, requirements = ?, source = ?, description = ?, description_eot = ? WHERE id = ?', [
    payload.name,
    payload.name_en,
    payload.requirements,
    payload.source,
    payload.description,
    payload.description_eot,
    id,
  ]);
}

export async function deleteTrait(id: number) {
  return query<any>('DELETE FROM traits WHERE id = ?', [id]);
}

export async function getTraitLikeCount(id: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM trait_likes WHERE trait_id = ?', [id]);
  return Number(rows?.[0]?.c || 0);
}

export async function hasTraitLike(id: number, userId: number) {
  const rows = await query<any[]>('SELECT 1 AS ok FROM trait_likes WHERE trait_id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return Boolean(rows && rows[0]);
}

export async function listTraitComments(id: number) {
  return query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM trait_comments c JOIN users u ON c.user_id = u.id WHERE c.trait_id = ? ORDER BY c.created_at ASC, c.id ASC',
    [id]
  );
}

export async function insertTraitComment(traitId: number, userId: number, content: string) {
  return query<any>('INSERT INTO trait_comments (trait_id, user_id, content) VALUES (?, ?, ?)', [traitId, userId, content]);
}

export async function findTraitCommentById(id: number) {
  const rows = await query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM trait_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function findTraitComment(traitId: number, commentId: number) {
  const rows = await query<any[]>('SELECT id FROM trait_comments WHERE id = ? AND trait_id = ? LIMIT 1', [commentId, traitId]);
  return rows && rows[0];
}

export async function deleteTraitComment(traitId: number, commentId: number) {
  return query<any>('DELETE FROM trait_comments WHERE id = ? AND trait_id = ? LIMIT 1', [commentId, traitId]);
}

export async function likeTrait(id: number, userId: number) {
  await query<any>('INSERT IGNORE INTO trait_likes (trait_id, user_id) VALUES (?, ?)', [id, userId]);
  return getTraitLikeCount(id);
}

export async function unlikeTrait(id: number, userId: number) {
  await query<any>('DELETE FROM trait_likes WHERE trait_id = ? AND user_id = ?', [id, userId]);
  return getTraitLikeCount(id);
}
