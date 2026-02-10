import { HttpError } from '../../utils/httpError';
import { isValidWondrousRarity, normalizeWondrousRarity, toBool } from '../../utils/normalizers';
import { validateSourcesExist } from '../../utils/referenceValidation';
import {
  deleteComment,
  deleteItem,
  findComment,
  findCommentById,
  findItemById,
  getItemLikeCount,
  hasItemLike,
  insertComment,
  insertItem,
  likeItem,
  listComments,
  listItems,
  listItemsAdmin,
  unlikeItem,
  updateItem,
} from './wondrous.repository';

export async function listWondrousItems() {
  return listItems();
}

export async function listWondrousItemsAdmin() {
  return listItemsAdmin();
}

export async function getWondrousItemById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const item = await findItemById(id);
  if (!item) throw new HttpError(404, 'Чудесный предмет не найден');
  return item;
}

export async function getWondrousLikes(id: number, userId?: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await getItemLikeCount(id);
  let liked = false;
  if (userId) liked = await hasItemLike(id, userId);
  return { count, liked };
}

export async function listWondrousComments(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  return listComments(id);
}

export async function addWondrousComment(id: number, userId: number, contentRaw: string) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const content = String(contentRaw || '').trim();
  if (!content) throw new HttpError(400, 'Комментарий не может быть пустым');
  if (content.length > 2000) throw new HttpError(400, 'Комментарий слишком длинный (макс. 2000 символов)');

  const exists = await findItemById(id);
  if (!exists) throw new HttpError(404, 'Чудесный предмет не найден');

  const result = await insertComment(id, userId, content);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  const created = await findCommentById(insertedId);
  return created || { id: insertedId, content, created_at: new Date().toISOString() };
}

export async function deleteWondrousComment(itemId: number, commentId: number) {
  if (!Number.isFinite(itemId) || itemId <= 0) throw new HttpError(400, 'Некорректный id');
  if (!Number.isFinite(commentId) || commentId <= 0) throw new HttpError(400, 'Некорректный id комментария');
  const exists = await findComment(itemId, commentId);
  if (!exists) throw new HttpError(404, 'Комментарий не найден');
  await deleteComment(itemId, commentId);
  return { ok: true };
}

export async function likeWondrousItem(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await likeItem(id, userId);
  return { count, liked: true };
}

export async function unlikeWondrousItem(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await unlikeItem(id, userId);
  return { count, liked: false };
}

export async function createWondrousItem(body: any) {
  const {
    name,
    name_en,
    item_type,
    rarity,
    recommended_cost,
    rarity_eot,
    recommended_cost_eot,
    attunement_required,
    attunement_by,
    source,
    description,
    description_eot,
  } = body || {};

  if (!name || !String(name).trim()) throw new HttpError(400, 'Название предмета обязательно');

  const normalizedType = String(item_type || '').trim() || 'Чудесный предмет';
  const normalizedRarity = normalizeWondrousRarity(rarity || 'common');
  if (!isValidWondrousRarity(normalizedRarity)) throw new HttpError(400, 'Некорректная редкость предмета');

  const normalizedRarityEot = rarity_eot ? normalizeWondrousRarity(rarity_eot) : null;
  if (normalizedRarityEot && !isValidWondrousRarity(normalizedRarityEot)) {
    throw new HttpError(400, 'Некорректная редкость предмета (EoT)');
  }

  const invalidSources = await validateSourcesExist(source);
  if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);

  const requiresAttunement = toBool(attunement_required);
  const attuneBy = requiresAttunement ? String(attunement_by || '').trim() || null : null;

  const result = await insertItem({
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    item_type: normalizedType,
    rarity: normalizedRarity,
    recommended_cost: recommended_cost ? String(recommended_cost).trim() : null,
    rarity_eot: normalizedRarityEot,
    recommended_cost_eot: recommended_cost_eot ? String(recommended_cost_eot).trim() : null,
    attunement_required: requiresAttunement ? 1 : 0,
    attunement_by: attuneBy,
    source: source ? String(source).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  });

  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return {
    id: insertedId,
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    item_type: normalizedType,
    rarity: normalizedRarity,
    recommended_cost: recommended_cost ? String(recommended_cost).trim() : null,
    rarity_eot: normalizedRarityEot,
    recommended_cost_eot: recommended_cost_eot ? String(recommended_cost_eot).trim() : null,
    attunement_required: requiresAttunement ? 1 : 0,
    attunement_by: attuneBy,
    source: source ? String(source).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  };
}

export async function updateWondrousItem(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findItemById(id);
  if (!existing) throw new HttpError(404, 'Чудесный предмет не найден');

  const normOpt = (v: any) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const s = String(v).trim();
    return s ? s : null;
  };

  const nextName = body.name !== undefined ? String(body.name).trim() : existing.name;
  if (!nextName) throw new HttpError(400, 'Название предмета обязательно');

  const nextTypeRaw = body.item_type !== undefined ? String(body.item_type).trim() : String(existing.item_type || '').trim();
  const nextType = nextTypeRaw || String(existing.item_type || '').trim() || 'Чудесный предмет';

  const nextRarityRaw = body.rarity !== undefined ? body.rarity : existing.rarity;
  const nextRarity = normalizeWondrousRarity(nextRarityRaw || 'common');
  if (!isValidWondrousRarity(nextRarity)) throw new HttpError(400, 'Некорректная редкость предмета');

  const nextRarityEotRaw = body.rarity_eot !== undefined ? body.rarity_eot : existing.rarity_eot;
  const nextRarityEot = nextRarityEotRaw ? normalizeWondrousRarity(nextRarityEotRaw) : null;
  if (nextRarityEot && !isValidWondrousRarity(nextRarityEot)) {
    throw new HttpError(400, 'Некорректная редкость предмета (EoT)');
  }

  const nextAttunementRequired = body.attunement_required !== undefined ? toBool(body.attunement_required) : Boolean(existing.attunement_required);
  const nextAttunementBy = nextAttunementRequired
    ? (normOpt(body.attunement_by) === undefined ? normOpt(existing.attunement_by) : normOpt(body.attunement_by))
    : null;

  const merged = {
    name: nextName,
    name_en: normOpt(body.name_en) === undefined ? existing.name_en : normOpt(body.name_en),
    item_type: nextType,
    rarity: nextRarity,
    recommended_cost: normOpt(body.recommended_cost) === undefined ? normOpt(existing.recommended_cost) : normOpt(body.recommended_cost),
    rarity_eot: nextRarityEot,
    recommended_cost_eot: normOpt(body.recommended_cost_eot) === undefined ? normOpt(existing.recommended_cost_eot) : normOpt(body.recommended_cost_eot),
    attunement_required: nextAttunementRequired ? 1 : 0,
    attunement_by: nextAttunementBy,
    source: normOpt(body.source) === undefined ? existing.source : normOpt(body.source),
    description: body.description === undefined ? existing.description : body.description === null ? null : String(body.description),
    description_eot: body.description_eot === undefined ? existing.description_eot : body.description_eot === null ? null : String(body.description_eot),
  } as any;

  if (body.source !== undefined) {
    const invalidSources = await validateSourcesExist(merged.source);
    if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);
  }

  await updateItem(id, merged);
  return { id, ...merged };
}

export async function deleteWondrousItem(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteItem(id);
  return { message: 'Чудесный предмет удален' };
}
