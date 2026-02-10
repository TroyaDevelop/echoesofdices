import { query } from '../../db/pool';

export async function listItems() {
  return query<any[]>('SELECT id, name, name_en, item_type, rarity, recommended_cost, rarity_eot, recommended_cost_eot, attunement_required, attunement_by, source, description, description_eot, created_at, updated_at FROM wondrous_items ORDER BY name ASC', []);
}

export async function listItemsAdmin() {
  return query<any[]>('SELECT id, name, name_en, item_type, rarity, recommended_cost, rarity_eot, recommended_cost_eot, attunement_required, attunement_by, source, description, description_eot, created_at, updated_at FROM wondrous_items ORDER BY name ASC', []);
}

export async function findItemById(id: number) {
  const rows = await query<any[]>('SELECT id, name, name_en, item_type, rarity, recommended_cost, rarity_eot, recommended_cost_eot, attunement_required, attunement_by, source, description, description_eot, created_at, updated_at FROM wondrous_items WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function insertItem(payload: any) {
  return query<any>('INSERT INTO wondrous_items (name, name_en, item_type, rarity, recommended_cost, rarity_eot, recommended_cost_eot, attunement_required, attunement_by, source, description, description_eot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    payload.name,
    payload.name_en,
    payload.item_type,
    payload.rarity,
    payload.recommended_cost,
    payload.rarity_eot,
    payload.recommended_cost_eot,
    payload.attunement_required,
    payload.attunement_by,
    payload.source,
    payload.description,
    payload.description_eot,
  ]);
}

export async function updateItem(id: number, payload: any) {
  return query<any>('UPDATE wondrous_items SET name = ?, name_en = ?, item_type = ?, rarity = ?, recommended_cost = ?, rarity_eot = ?, recommended_cost_eot = ?, attunement_required = ?, attunement_by = ?, source = ?, description = ?, description_eot = ? WHERE id = ?', [
    payload.name,
    payload.name_en,
    payload.item_type,
    payload.rarity,
    payload.recommended_cost,
    payload.rarity_eot,
    payload.recommended_cost_eot,
    payload.attunement_required,
    payload.attunement_by,
    payload.source,
    payload.description,
    payload.description_eot,
    id,
  ]);
}

export async function deleteItem(id: number) {
  return query<any>('DELETE FROM wondrous_items WHERE id = ?', [id]);
}

export async function getItemLikeCount(id: number) {
  const rows = await query<any[]>('SELECT COUNT(*) AS c FROM wondrous_item_likes WHERE wondrous_item_id = ?', [id]);
  return Number(rows?.[0]?.c || 0);
}

export async function hasItemLike(id: number, userId: number) {
  const rows = await query<any[]>('SELECT 1 AS ok FROM wondrous_item_likes WHERE wondrous_item_id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return Boolean(rows && rows[0]);
}

export async function listComments(id: number) {
  return query<any[]>('SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM wondrous_item_comments c JOIN users u ON c.user_id = u.id WHERE c.wondrous_item_id = ? ORDER BY c.created_at ASC, c.id ASC', [id]);
}

export async function insertComment(itemId: number, userId: number, content: string) {
  return query<any>('INSERT INTO wondrous_item_comments (wondrous_item_id, user_id, content) VALUES (?, ?, ?)', [itemId, userId, content]);
}

export async function findCommentById(id: number) {
  const rows = await query<any[]>('SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM wondrous_item_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function findComment(itemId: number, commentId: number) {
  const rows = await query<any[]>('SELECT id FROM wondrous_item_comments WHERE id = ? AND wondrous_item_id = ? LIMIT 1', [commentId, itemId]);
  return rows && rows[0];
}

export async function deleteComment(itemId: number, commentId: number) {
  return query<any>('DELETE FROM wondrous_item_comments WHERE id = ? AND wondrous_item_id = ? LIMIT 1', [commentId, itemId]);
}

export async function likeItem(id: number, userId: number) {
  await query<any>('INSERT IGNORE INTO wondrous_item_likes (wondrous_item_id, user_id) VALUES (?, ?)', [id, userId]);
  return getItemLikeCount(id);
}

export async function unlikeItem(id: number, userId: number) {
  await query<any>('DELETE FROM wondrous_item_likes WHERE wondrous_item_id = ? AND user_id = ?', [id, userId]);
  return getItemLikeCount(id);
}
