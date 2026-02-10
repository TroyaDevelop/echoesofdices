import { HttpError } from '../../utils/httpError';
import { slugify } from '../../utils/slug';
import { deleteNews, findById, findBySlug, insertNews, listAdmin, listPublished, updateNews } from './news.repository';

async function ensureUniqueSlug(base: string) {
  const baseSlug = base || `post-${Date.now()}`;
  let candidate = baseSlug;
  let i = 2;

  while (i < 200) {
    const rows = await findBySlug(candidate);
    if (!rows) return candidate;
    candidate = `${baseSlug}-${i}`;
    i += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function listNews() {
  return listPublished();
}

export async function listNewsAdmin() {
  return listAdmin();
}

export async function createNews(input: any, authorId: number) {
  const { title, content, excerpt, status } = input || {};
  if (!title || !content) throw new HttpError(400, 'Заполните заголовок и текст');
  const baseSlug = slugify(title) || `post-${Date.now()}`;
  const slug = await ensureUniqueSlug(baseSlug);
  const finalStatus = status === 'draft' ? 'draft' : 'published';

  const result = await insertNews({
    title: String(title).trim(),
    slug,
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
    excerpt: excerpt ? String(excerpt) : null,
    content: String(content),
    status: finalStatus,
  };
}

export async function updateNewsById(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findById(id);
  if (!existing) throw new HttpError(404, 'Новость не найдена');

  const nextTitle = body.title !== undefined ? String(body.title).trim() : existing.title;
  const nextContent = body.content !== undefined ? String(body.content) : existing.content;
  const nextExcerpt =
    body.excerpt !== undefined ? (body.excerpt ? String(body.excerpt).trim() : null) : existing.excerpt;
  const nextStatus = body.status !== undefined ? (body.status === 'draft' ? 'draft' : 'published') : existing.status;

  if (!nextTitle) throw new HttpError(400, 'Заполните заголовок');
  if (!nextContent || !String(nextContent).trim()) throw new HttpError(400, 'Заполните текст');

  await updateNews(id, { title: nextTitle, excerpt: nextExcerpt, content: nextContent, status: nextStatus });

  return {
    id,
    slug: existing.slug,
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
    status: nextStatus,
  };
}

export async function deleteNewsById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteNews(id);
  return { message: 'Новость удалена' };
}
