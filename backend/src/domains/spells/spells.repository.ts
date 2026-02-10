import { query } from '../../db/pool';

export async function listSpells() {
  return query<any[]>('SELECT id, name, level, school, components, classes, description, description_eot, created_at, updated_at FROM spells ORDER BY name ASC', []);
}

export async function listSpellsAdmin() {
  return query<any[]>('SELECT id, name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description, description_eot, created_at, updated_at FROM spells ORDER BY name ASC', []);
}

export async function findSpellById(id: number) {
  const rows = await query<any[]>(
    'SELECT id, name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description, description_eot, created_at, updated_at FROM spells WHERE id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function insertSpell(payload: any) {
  return query<any>(
    'INSERT INTO spells (name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description, description_eot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      payload.name,
      payload.name_en,
      payload.level,
      payload.school,
      payload.theme,
      payload.casting_time,
      payload.range_text,
      payload.components,
      payload.duration,
      payload.classes,
      payload.subclasses,
      payload.source,
      payload.source_pages,
      payload.description,
      payload.description_eot,
    ]
  );
}

export async function updateSpell(id: number, payload: any) {
  return query<any>(
    'UPDATE spells SET name = ?, name_en = ?, level = ?, school = ?, theme = ?, casting_time = ?, range_text = ?, components = ?, duration = ?, classes = ?, subclasses = ?, source = ?, source_pages = ?, description = ?, description_eot = ? WHERE id = ?',
    [
      payload.name,
      payload.name_en,
      payload.level,
      payload.school,
      payload.theme,
      payload.casting_time,
      payload.range_text,
      payload.components,
      payload.duration,
      payload.classes,
      payload.subclasses,
      payload.source,
      payload.source_pages,
      payload.description,
      payload.description_eot,
      id,
    ]
  );
}

export async function deleteSpell(id: number) {
  return query<any>('DELETE FROM spells WHERE id = ?', [id]);
}

export async function listSpellClasses() {
  return query<any[]>('SELECT id, name FROM spell_classes ORDER BY name ASC', []);
}

export async function createSpellClass(name: string) {
  return query<any>('INSERT INTO spell_classes (name) VALUES (?)', [name]);
}

export async function deleteSpellClass(id: number) {
  return query<any>('DELETE FROM spell_classes WHERE id = ? LIMIT 1', [id]);
}

export async function listSources() {
  return query<any[]>('SELECT id, name FROM sources ORDER BY name ASC', []);
}

export async function createSource(name: string) {
  return query<any>('INSERT INTO sources (name) VALUES (?)', [name]);
}

export async function deleteSource(id: number) {
  return query<any>('DELETE FROM sources WHERE id = ? LIMIT 1', [id]);
}

export async function getSpellLikeCount(id: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM spell_likes WHERE spell_id = ?', [id]);
  return Number(rows?.[0]?.c || 0);
}

export async function hasSpellLike(id: number, userId: number) {
  const rows = await query<any[]>('SELECT 1 AS ok FROM spell_likes WHERE spell_id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return Boolean(rows && rows[0]);
}

export async function hasSpellFavorite(id: number, userId: number) {
  const rows = await query<any[]>('SELECT 1 AS ok FROM spell_favorites WHERE spell_id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return Boolean(rows && rows[0]);
}

export async function listSpellComments(id: number) {
  return query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM spell_comments c JOIN users u ON c.user_id = u.id WHERE c.spell_id = ? ORDER BY c.created_at ASC, c.id ASC',
    [id]
  );
}

export async function insertSpellComment(spellId: number, userId: number, content: string) {
  return query<any>('INSERT INTO spell_comments (spell_id, user_id, content) VALUES (?, ?, ?)', [spellId, userId, content]);
}

export async function findSpellCommentById(id: number) {
  const rows = await query<any[]>(
    'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM spell_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function findSpellComment(spellId: number, commentId: number) {
  const rows = await query<any[]>('SELECT id FROM spell_comments WHERE id = ? AND spell_id = ? LIMIT 1', [commentId, spellId]);
  return rows && rows[0];
}

export async function deleteSpellComment(spellId: number, commentId: number) {
  return query<any>('DELETE FROM spell_comments WHERE id = ? AND spell_id = ? LIMIT 1', [commentId, spellId]);
}

export async function likeSpell(id: number, userId: number) {
  await query<any>('INSERT IGNORE INTO spell_likes (spell_id, user_id) VALUES (?, ?)', [id, userId]);
  return getSpellLikeCount(id);
}

export async function unlikeSpell(id: number, userId: number) {
  await query<any>('DELETE FROM spell_likes WHERE spell_id = ? AND user_id = ?', [id, userId]);
  return getSpellLikeCount(id);
}

export async function listFavorites(userId: number) {
  return query<any[]>(
    'SELECT s.id, s.name, s.name_en, s.level, s.school, s.classes, s.description, sf.created_at AS favorited_at FROM spell_favorites sf JOIN spells s ON s.id = sf.spell_id WHERE sf.user_id = ? ORDER BY sf.created_at DESC',
    [userId]
  );
}

export async function favoriteSpell(id: number, userId: number) {
  return query<any>('INSERT IGNORE INTO spell_favorites (spell_id, user_id) VALUES (?, ?)', [id, userId]);
}

export async function unfavoriteSpell(id: number, userId: number) {
  return query<any>('DELETE FROM spell_favorites WHERE spell_id = ? AND user_id = ?', [id, userId]);
}
