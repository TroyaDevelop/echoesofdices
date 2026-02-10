import { HttpError } from '../../utils/httpError';
import { slugify } from '../../utils/slug';
import { validateSourcesExist } from '../../utils/referenceValidation';
import { deleteArticle, findById, findBySlug, findSlug, insertArticle, listAdmin, listPublished, updateArticle } from './articles.repository';

async function ensureUniqueSlug(base: string) {
  const baseSlug = base || `article-${Date.now()}`;
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

export async function listArticles() {
  return listPublished();
}

export async function listArticlesAdmin() {
  return listAdmin();
}

export async function getArticleBySlug(slug: string) {
  const value = String(slug || '').trim();
  if (!value) throw new HttpError(400, 'Некорректный slug');
  const article = await findBySlug(value);
  if (!article) throw new HttpError(404, 'Статья не найдена');
  return article;
}

export async function createArticle(input: any, authorId: number) {
  const { title, content, excerpt, status, source, source_pages } = input || {};

  if (!title || !content) throw new HttpError(400, 'Заполните заголовок и текст');

  const invalidSources = await validateSourcesExist(source);
  if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);

  const baseSlug = slugify(title) || `article-${Date.now()}`;
  const slug = await ensureUniqueSlug(baseSlug);
  const finalStatus = status === 'draft' ? 'draft' : 'published';

  const result = await insertArticle({
    title: String(title).trim(),
    slug,
    content: String(content),
    excerpt: excerpt ? String(excerpt) : null,
    source: source ? String(source).trim() : null,
    source_pages: source_pages ? String(source_pages).trim() : null,
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
    source: source ? String(source).trim() : null,
    source_pages: source_pages ? String(source_pages).trim() : null,
    status: finalStatus,
  };
}

export async function updateArticleById(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findById(id);
  if (!existing) throw new HttpError(404, 'Статья не найдена');

  const nextTitle = body.title !== undefined ? String(body.title).trim() : existing.title;
  const nextContent = body.content !== undefined ? String(body.content) : existing.content;
  const nextExcerpt =
    body.excerpt !== undefined ? (body.excerpt ? String(body.excerpt).trim() : null) : existing.excerpt;
  const nextStatus = body.status !== undefined ? (body.status === 'draft' ? 'draft' : 'published') : existing.status;
  const nextSource = body.source !== undefined ? (body.source ? String(body.source).trim() : null) : existing.source;
  const nextSourcePages =
    body.source_pages !== undefined ? (body.source_pages ? String(body.source_pages).trim() : null) : existing.source_pages;

  if (!nextTitle) throw new HttpError(400, 'Заполните заголовок');
  if (!nextContent || !String(nextContent).trim()) throw new HttpError(400, 'Заполните текст');

  if (body.source !== undefined) {
    const invalidSources = await validateSourcesExist(nextSource);
    if (invalidSources.length > 0) throw new HttpError(400, `Неизвестные источники: ${invalidSources.join(', ')}`);
  }

  await updateArticle(id, {
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
    source: nextSource,
    source_pages: nextSourcePages,
    status: nextStatus,
  });

  return {
    id,
    slug: existing.slug,
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
    source: nextSource,
    source_pages: nextSourcePages,
    status: nextStatus,
  };
}

export async function deleteArticleById(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteArticle(id);
  return { message: 'Статья удалена' };
}
