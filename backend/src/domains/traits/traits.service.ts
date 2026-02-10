import { HttpError } from '../../utils/httpError';
import { validateSourcesExist } from '../../utils/referenceValidation';
import {
  deleteTrait,
  deleteTraitComment,
  findTraitById,
  findTraitComment,
  findTraitCommentById,
  getTraitLikeCount,
  hasTraitLike,
  insertTrait,
  insertTraitComment,
  likeTrait,
  listTraitComments,
  listTraits,
  listTraitsAdmin,
  unlikeTrait,
  updateTrait,
} from './traits.repository';

export async function listTraitsPublic() {
  return listTraits();
}

export async function listTraitsAdminData() {
  return listTraitsAdmin();
}

export async function getTraitById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const trait = await findTraitById(id);
  if (!trait) throw new HttpError(404, 'Черта не найдена');
  return trait;
}

export async function getTraitLikes(id: number, userId?: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await getTraitLikeCount(id);
  let liked = false;
  if (userId) liked = await hasTraitLike(id, userId);
  return { count, liked };
}

export async function listComments(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  return listTraitComments(id);
}

export async function addComment(id: number, userId: number, contentRaw: string) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const content = String(contentRaw || '').trim();
  if (!content) throw new HttpError(400, 'Комментарий не может быть пустым');
  if (content.length > 2000) throw new HttpError(400, 'Комментарий слишком длинный (макс. 2000 символов)');

  const exists = await findTraitById(id);
  if (!exists) throw new HttpError(404, 'Черта не найдена');

  const result = await insertTraitComment(id, userId, content);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  const created = await findTraitCommentById(insertedId);
  return created || { id: insertedId, content, created_at: new Date().toISOString() };
}

export async function deleteComment(traitId: number, commentId: number) {
  if (!Number.isFinite(traitId) || traitId <= 0) throw new HttpError(400, 'Некорректный id');
  if (!Number.isFinite(commentId) || commentId <= 0) throw new HttpError(400, 'Некорректный id комментария');
  const exists = await findTraitComment(traitId, commentId);
  if (!exists) throw new HttpError(404, 'Комментарий не найден');
  await deleteTraitComment(traitId, commentId);
  return { ok: true };
}

export async function like(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await likeTrait(id, userId);
  return { count, liked: true };
}

export async function unlike(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await unlikeTrait(id, userId);
  return { count, liked: false };
}

export async function createTraitRecord(body: any) {
  const { name, name_en, requirements, source, description, description_eot } = body || {};

  const invalidSources = await validateSourcesExist(source);
  if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);

  if (!name || !String(name).trim()) throw new HttpError(400, 'Название черты обязательно');

  const result = await insertTrait({
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    requirements: requirements ? String(requirements).trim() : null,
    source: source ? String(source).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  });

  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return {
    id: insertedId,
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    requirements: requirements ? String(requirements).trim() : null,
    source: source ? String(source).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  };
}

export async function updateTraitRecord(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findTraitById(id);
  if (!existing) throw new HttpError(404, 'Черта не найдена');

  const normOpt = (v: any) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const s = String(v).trim();
    return s ? s : null;
  };

  const nextName = body.name !== undefined ? String(body.name).trim() : existing.name;
  if (!nextName) throw new HttpError(400, 'Название черты обязательно');

  const merged = {
    name: nextName,
    name_en: normOpt(body.name_en) === undefined ? existing.name_en : normOpt(body.name_en),
    requirements: normOpt(body.requirements) === undefined ? existing.requirements : normOpt(body.requirements),
    source: normOpt(body.source) === undefined ? existing.source : normOpt(body.source),
    description: body.description === undefined ? existing.description : body.description === null ? null : String(body.description),
    description_eot: body.description_eot === undefined ? existing.description_eot : body.description_eot === null ? null : String(body.description_eot),
  } as any;

  if (body.source !== undefined) {
    const invalidSources = await validateSourcesExist(merged.source);
    if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);
  }

  await updateTrait(id, merged);
  return { id, ...merged };
}

export async function deleteTraitRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteTrait(id);
  return { message: 'Черта удалена' };
}
