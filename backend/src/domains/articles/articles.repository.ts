import { query } from '../../db/pool';

export async function listPublished() {
  return query<any[]>(
    "SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.source, a.source_pages, a.status, a.created_at, a.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.status = 'published' ORDER BY a.created_at DESC",
    []
  );
}

export async function listAdmin() {
  return query<any[]>('SELECT id, title, slug, excerpt, content, source, source_pages, status, created_at, updated_at FROM articles ORDER BY created_at DESC', []);
}

export async function findBySlug(slug: string) {
  const rows = await query<any[]>(
    "SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.source, a.source_pages, a.status, a.created_at, a.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.slug = ? AND a.status = 'published' LIMIT 1",
    [slug]
  );
  return rows && rows[0];
}

export async function findById(id: number) {
  const rows = await query<any[]>('SELECT id, title, excerpt, content, status, slug, source, source_pages FROM articles WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function findSlug(slug: string) {
  const rows = await query<any[]>('SELECT id FROM articles WHERE slug = ? LIMIT 1', [slug]);
  return rows && rows[0];
}

export async function insertArticle(payload: any) {
  return query<any>(
    'INSERT INTO articles (title, slug, content, excerpt, source, source_pages, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [payload.title, payload.slug, payload.content, payload.excerpt, payload.source, payload.source_pages, payload.authorId, payload.status]
  );
}

export async function updateArticle(id: number, payload: any) {
  return query<any>('UPDATE articles SET title = ?, excerpt = ?, content = ?, source = ?, source_pages = ?, status = ? WHERE id = ?', [
    payload.title,
    payload.excerpt,
    payload.content,
    payload.source,
    payload.source_pages,
    payload.status,
    id,
  ]);
}

export async function deleteArticle(id: number) {
  return query<any>('DELETE FROM articles WHERE id = ?', [id]);
}
