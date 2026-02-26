import { HttpError } from '../../utils/httpError';
import { validateSourcesExist } from '../../utils/referenceValidation';
import {
  deleteBackground,
  deleteBackgroundComment,
  findBackgroundById,
  findBackgroundComment,
  findBackgroundCommentById,
  getBackgroundLikeCount,
  hasBackgroundLike,
  insertBackground,
  insertBackgroundComment,
  likeBackground,
  listBackgroundComments,
  listBackgrounds,
  listBackgroundsAdmin,
  unlikeBackground,
  updateBackground,
} from './backgrounds.repository';

const normalizeOpt = (value: any) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeText = (value: any) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = String(value);
  return normalized.trim() ? normalized : null;
};

export async function listBackgroundsPublic() {
  return listBackgrounds();
}

export async function listBackgroundsAdminData() {
  return listBackgroundsAdmin();
}

export async function getBackgroundById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const background = await findBackgroundById(id);
  if (!background) throw new HttpError(404, 'Предыстория не найдена');
  return background;
}

export async function getBackgroundLikes(id: number, userId?: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await getBackgroundLikeCount(id);
  let liked = false;
  if (userId) liked = await hasBackgroundLike(id, userId);
  return { count, liked };
}

export async function listComments(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  return listBackgroundComments(id);
}

export async function addComment(id: number, userId: number, contentRaw: string) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const content = String(contentRaw || '').trim();
  if (!content) throw new HttpError(400, 'Комментарий не может быть пустым');
  if (content.length > 2000) throw new HttpError(400, 'Комментарий слишком длинный (макс. 2000 символов)');

  const exists = await findBackgroundById(id);
  if (!exists) throw new HttpError(404, 'Предыстория не найдена');

  const result = await insertBackgroundComment(id, userId, content);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  const created = await findBackgroundCommentById(insertedId);
  return created || { id: insertedId, content, created_at: new Date().toISOString() };
}

export async function deleteComment(backgroundId: number, commentId: number) {
  if (!Number.isFinite(backgroundId) || backgroundId <= 0) throw new HttpError(400, 'Некорректный id');
  if (!Number.isFinite(commentId) || commentId <= 0) throw new HttpError(400, 'Некорректный id комментария');
  const exists = await findBackgroundComment(backgroundId, commentId);
  if (!exists) throw new HttpError(404, 'Комментарий не найден');
  await deleteBackgroundComment(backgroundId, commentId);
  return { ok: true };
}

export async function like(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await likeBackground(id, userId);
  return { count, liked: true };
}

export async function unlike(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await unlikeBackground(id, userId);
  return { count, liked: false };
}

export async function createBackgroundRecord(body: any) {
  const payload = {
    name: normalizeOpt(body?.name),
    name_en: normalizeOpt(body?.name_en),
    skill_proficiencies: normalizeOpt(body?.skill_proficiencies),
    tool_proficiencies: normalizeOpt(body?.tool_proficiencies),
    equipment: normalizeText(body?.equipment),
    source: normalizeOpt(body?.source),
    description: normalizeText(body?.description),
    specialty_title: normalizeOpt(body?.specialty_title),
    specialty_dice: normalizeOpt(body?.specialty_dice),
    specialty_table: normalizeText(body?.specialty_table),
    feature_title: normalizeOpt(body?.feature_title),
    feature_description: normalizeText(body?.feature_description),
    personalization: normalizeText(body?.personalization),
  } as any;

  if (!payload.name) throw new HttpError(400, 'Название предыстории обязательно');

  const invalidSources = await validateSourcesExist(payload.source);
  if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);

  const result = await insertBackground(payload);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return { id: insertedId, ...payload };
}

export async function updateBackgroundRecord(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findBackgroundById(id);
  if (!existing) throw new HttpError(404, 'Предыстория не найдена');

  const merged = {
    name: normalizeOpt(body?.name) === undefined ? existing.name : normalizeOpt(body?.name),
    name_en: normalizeOpt(body?.name_en) === undefined ? existing.name_en : normalizeOpt(body?.name_en),
    skill_proficiencies: normalizeOpt(body?.skill_proficiencies) === undefined ? existing.skill_proficiencies : normalizeOpt(body?.skill_proficiencies),
    tool_proficiencies: normalizeOpt(body?.tool_proficiencies) === undefined ? existing.tool_proficiencies : normalizeOpt(body?.tool_proficiencies),
    equipment: normalizeText(body?.equipment) === undefined ? existing.equipment : normalizeText(body?.equipment),
    source: normalizeOpt(body?.source) === undefined ? existing.source : normalizeOpt(body?.source),
    description: normalizeText(body?.description) === undefined ? existing.description : normalizeText(body?.description),
    specialty_title: normalizeOpt(body?.specialty_title) === undefined ? existing.specialty_title : normalizeOpt(body?.specialty_title),
    specialty_dice: normalizeOpt(body?.specialty_dice) === undefined ? existing.specialty_dice : normalizeOpt(body?.specialty_dice),
    specialty_table: normalizeText(body?.specialty_table) === undefined ? existing.specialty_table : normalizeText(body?.specialty_table),
    feature_title: normalizeOpt(body?.feature_title) === undefined ? existing.feature_title : normalizeOpt(body?.feature_title),
    feature_description: normalizeText(body?.feature_description) === undefined ? existing.feature_description : normalizeText(body?.feature_description),
    personalization: normalizeText(body?.personalization) === undefined ? existing.personalization : normalizeText(body?.personalization),
  } as any;

  if (!merged.name) throw new HttpError(400, 'Название предыстории обязательно');

  if (body?.source !== undefined) {
    const invalidSources = await validateSourcesExist(merged.source);
    if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);
  }

  await updateBackground(id, merged);
  return { id, ...merged };
}

export async function deleteBackgroundRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteBackground(id);
  return { message: 'Предыстория удалена' };
}
