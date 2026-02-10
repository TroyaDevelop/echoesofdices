import { HttpError } from '../../utils/httpError';
import { normalizeLoreLocations, normalizeLoreYear } from '../../utils/normalizers';
import { slugify } from '../../utils/slug';
import { deleteLocation, deleteLore, findById, findBySlug, findSlug, insertLocation, insertLore, listAdmin, listLocations, listPublished, updateLore } from './lore.repository';

async function ensureUniqueSlug(base: string) {
  const baseSlug = base || `lore-${Date.now()}`;
  let candidate = baseSlug;
  let i = 2;

  while (i < 200) {
    const rows = await findSlug(candidate);
    if (!rows) return candidate;
    candidate = `${baseSlug}-${i}`;
    i += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function listLore() {
  return listPublished();
}

export async function listLoreAdmin() {
  return listAdmin();
}

export async function listLoreLocations() {
  return listLocations();
}

export async function createLoreLocation(name: string) {
  const value = String(name || '').trim();
  if (!value) throw new HttpError(400, 'Название локации обязательно');
  if (value.length > 120) throw new HttpError(400, 'Название слишком длинное');
  const result = await insertLocation(value);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, name: value };
}

export async function deleteLoreLocation(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteLocation(id);
  return { message: 'Локация удалена' };
}

export async function getLoreBySlug(slug: string) {
  const value = String(slug || '').trim();
  if (!value) throw new HttpError(400, 'Некорректный slug');
  const article = await findBySlug(value);
  if (!article) throw new HttpError(404, 'Статья не найдена');
  return article;
}

export async function createLore(input: any, authorId: number) {
  const { title, content, excerpt, status, year, locations } = input || {};
  if (!title || !content) throw new HttpError(400, 'Заполните заголовок и текст');

  const loreYear = normalizeLoreYear(year, null);
  if (loreYear === null) throw new HttpError(400, 'Год должен быть числом');

  const normalizedLocations = normalizeLoreLocations(locations);

  const baseSlug = slugify(title) || `lore-${Date.now()}`;
  const slug = await ensureUniqueSlug(baseSlug);
  const finalStatus = status === 'draft' ? 'draft' : 'published';

  const result = await insertLore({
    title: String(title).trim(),
    slug,
    year: loreYear,
    locations: normalizedLocations,
    content: String(content),
    excerpt: excerpt ? String(excerpt) : null,
    authorId,
    status: finalStatus,
  });

  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return {
    id: insertedId,
    title: String(title).trim(),
    slug,
    year: loreYear,
    locations: normalizedLocations,
    excerpt: excerpt ? String(excerpt) : null,
    content: String(content),
    status: finalStatus,
  };
}

export async function updateLoreById(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findById(id);
  if (!existing) throw new HttpError(404, 'Статья не найдена');

  const nextTitle = body.title !== undefined ? String(body.title).trim() : existing.title;
  const nextContent = body.content !== undefined ? String(body.content) : existing.content;
  const nextExcerpt =
    body.excerpt !== undefined ? (body.excerpt ? String(body.excerpt).trim() : null) : existing.excerpt;
  const nextStatus = body.status !== undefined ? (body.status === 'draft' ? 'draft' : 'published') : existing.status;
  const nextLocationsRaw = normalizeLoreLocations(body.locations !== undefined ? body.locations : existing.locations);
  const nextYear = body.year !== undefined ? normalizeLoreYear(body.year, null) : normalizeLoreYear(existing.year, null);

  if (!nextTitle) throw new HttpError(400, 'Заполните заголовок');
  if (!nextContent || !String(nextContent).trim()) throw new HttpError(400, 'Заполните текст');
  if (nextYear === null) throw new HttpError(400, 'Год должен быть числом');

  await updateLore(id, {
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
    status: nextStatus,
    year: nextYear,
    locations: nextLocationsRaw,
  });

  return {
    id,
    slug: existing.slug,
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
    status: nextStatus,
    year: nextYear,
    locations: nextLocationsRaw,
  };
}

export async function deleteLoreById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteLore(id);
  return { message: 'Статья удалена' };
}
