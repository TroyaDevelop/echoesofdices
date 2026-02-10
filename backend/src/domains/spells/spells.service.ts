import { HttpError } from '../../utils/httpError';
import { normalizeSpellTheme } from '../../utils/normalizers';
import { validateClassesExist, validateSourcesExist } from '../../utils/referenceValidation';
import {
  createSource,
  createSpellClass,
  deleteSource,
  deleteSpell,
  deleteSpellClass,
  deleteSpellComment,
  findSpellById,
  findSpellComment,
  findSpellCommentById,
  getSpellLikeCount,
  hasSpellFavorite,
  hasSpellLike,
  insertSpell,
  insertSpellComment,
  likeSpell,
  listFavorites,
  listSources,
  listSpellClasses as listSpellClassesRepo,
  listSpellComments,
  listSpells,
  listSpellsAdmin,
  unlikeSpell,
  unfavoriteSpell,
  updateSpell,
  favoriteSpell,
} from './spells.repository';

export async function listSpellsPublic() {
  return listSpells();
}

export async function listSpellsAdminData() {
  return listSpellsAdmin();
}

export async function getSpellById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const spell = await findSpellById(id);
  if (!spell) throw new HttpError(404, 'Заклинание не найдено');
  return spell;
}

export async function getSpellLikes(id: number, userId?: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await getSpellLikeCount(id);
  let liked = false;
  let favorited = false;
  if (userId) {
    liked = await hasSpellLike(id, userId);
    favorited = await hasSpellFavorite(id, userId);
  }
  return { count, liked, favorited };
}

export async function listComments(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  return listSpellComments(id);
}

export async function addComment(id: number, userId: number, contentRaw: string) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const content = String(contentRaw || '').trim();
  if (!content) throw new HttpError(400, 'Комментарий не может быть пустым');
  if (content.length > 2000) throw new HttpError(400, 'Комментарий слишком длинный (макс. 2000 символов)');

  const exists = await findSpellById(id);
  if (!exists) throw new HttpError(404, 'Заклинание не найдено');

  const result = await insertSpellComment(id, userId, content);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  const created = await findSpellCommentById(insertedId);
  return created || { id: insertedId, content, created_at: new Date().toISOString() };
}

export async function deleteComment(spellId: number, commentId: number) {
  if (!Number.isFinite(spellId) || spellId <= 0) throw new HttpError(400, 'Некорректный id');
  if (!Number.isFinite(commentId) || commentId <= 0) throw new HttpError(400, 'Некорректный id комментария');
  const exists = await findSpellComment(spellId, commentId);
  if (!exists) throw new HttpError(404, 'Комментарий не найден');
  await deleteSpellComment(spellId, commentId);
  return { ok: true };
}

export async function like(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await likeSpell(id, userId);
  return { count, liked: true };
}

export async function unlike(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const count = await unlikeSpell(id, userId);
  return { count, liked: false };
}

export async function listSpellClasses() {
  return listSpellClassesRepo();
}

export async function createSpellClassRecord(nameRaw: string) {
  const name = String(nameRaw || '').trim();
  if (!name) throw new HttpError(400, 'Название класса обязательно');
  const result = await createSpellClass(name);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, name };
}

export async function deleteSpellClassRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteSpellClass(id);
  return { ok: true };
}

export async function listSourcesData() {
  return listSources();
}

export async function createSourceRecord(nameRaw: string) {
  const name = String(nameRaw || '').trim();
  if (!name) throw new HttpError(400, 'Название источника обязательно');
  const result = await createSource(name);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, name };
}

export async function deleteSourceRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteSource(id);
  return { ok: true };
}

export async function createSpellRecord(body: any) {
  const {
    name,
    name_en,
    level,
    school,
    theme,
    casting_time,
    range_text,
    components,
    duration,
    classes,
    subclasses,
    source,
    source_pages,
    description,
    description_eot,
  } = body || {};

  const invalidClasses = await validateClassesExist(classes);
  if (invalidClasses.length > 0) throw new HttpError(400, `Неизвестные классы: ${invalidClasses.join(', ')}`);

  const invalidSources = await validateSourcesExist(source);
  if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);

  if (!name) throw new HttpError(400, 'Название заклинания обязательно');

  const lvl = Number(level);
  if (!Number.isFinite(lvl) || lvl < 0 || lvl > 9) throw new HttpError(400, 'Уровень должен быть от 0 до 9');

  const themeValue = normalizeSpellTheme(theme) ?? 'none';

  const result = await insertSpell({
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    level: lvl,
    school: school ? String(school).trim() : null,
    theme: themeValue,
    casting_time: casting_time ? String(casting_time).trim() : null,
    range_text: range_text ? String(range_text).trim() : null,
    components: components ? String(components).trim() : null,
    duration: duration ? String(duration).trim() : null,
    classes: classes ? String(classes).trim() : null,
    subclasses: subclasses ? String(subclasses).trim() : null,
    source: source ? String(source).trim() : null,
    source_pages: source_pages ? String(source_pages).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  });

  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return {
    id: insertedId,
    name: String(name).trim(),
    name_en: name_en ? String(name_en).trim() : null,
    level: lvl,
    school: school ? String(school).trim() : null,
    theme: themeValue,
    casting_time: casting_time ? String(casting_time).trim() : null,
    range_text: range_text ? String(range_text).trim() : null,
    components: components ? String(components).trim() : null,
    duration: duration ? String(duration).trim() : null,
    classes: classes ? String(classes).trim() : null,
    subclasses: subclasses ? String(subclasses).trim() : null,
    source: source ? String(source).trim() : null,
    source_pages: source_pages ? String(source_pages).trim() : null,
    description: description ? String(description) : null,
    description_eot: description_eot ? String(description_eot) : null,
  };
}

export async function updateSpellRecord(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findSpellById(id);
  if (!existing) throw new HttpError(404, 'Заклинание не найдено');

  const normOpt = (v: any) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const s = String(v).trim();
    return s ? s : null;
  };

  const nextName = body.name !== undefined ? String(body.name).trim() : existing.name;
  if (!nextName) throw new HttpError(400, 'Название заклинания обязательно');

  let nextLevel = existing.level;
  if (body.level !== undefined) {
    const lvl = Number(body.level);
    if (!Number.isFinite(lvl) || lvl < 0 || lvl > 9) throw new HttpError(400, 'Уровень должен быть от 0 до 9');
    nextLevel = lvl;
  }

  const merged = {
    name: nextName,
    name_en: normOpt(body.name_en) === undefined ? existing.name_en : normOpt(body.name_en),
    level: nextLevel,
    school: normOpt(body.school) === undefined ? existing.school : normOpt(body.school),
    theme: normalizeSpellTheme(body.theme) === undefined ? (existing.theme || 'none') : normalizeSpellTheme(body.theme),
    casting_time: normOpt(body.casting_time) === undefined ? existing.casting_time : normOpt(body.casting_time),
    range_text: normOpt(body.range_text) === undefined ? existing.range_text : normOpt(body.range_text),
    components: normOpt(body.components) === undefined ? existing.components : normOpt(body.components),
    duration: normOpt(body.duration) === undefined ? existing.duration : normOpt(body.duration),
    classes: normOpt(body.classes) === undefined ? existing.classes : normOpt(body.classes),
    subclasses: normOpt(body.subclasses) === undefined ? existing.subclasses : normOpt(body.subclasses),
    source: normOpt(body.source) === undefined ? existing.source : normOpt(body.source),
    source_pages: normOpt(body.source_pages) === undefined ? existing.source_pages : normOpt(body.source_pages),
    description: body.description === undefined ? existing.description : body.description === null ? null : String(body.description),
    description_eot: body.description_eot === undefined ? existing.description_eot : body.description_eot === null ? null : String(body.description_eot),
  } as any;

  const invalidClasses = await validateClassesExist(merged.classes);
  if (invalidClasses.length > 0) throw new HttpError(400, `Неизвестные классы: ${invalidClasses.join(', ')}`);

  if (body.source !== undefined) {
    const invalidSources = await validateSourcesExist(merged.source);
    if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);
  }

  await updateSpell(id, merged);
  return { id, ...merged };
}

export async function deleteSpellRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteSpell(id);
  return { message: 'Заклинание удалено' };
}

export async function listFavoriteSpells(userId: number) {
  return listFavorites(userId);
}

export async function favoriteSpellById(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await favoriteSpell(id, userId);
  return { favorited: true };
}

export async function unfavoriteSpellById(id: number, userId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await unfavoriteSpell(id, userId);
  return { favorited: false };
}
