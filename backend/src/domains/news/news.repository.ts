import { query } from '../../db/pool';

export async function listPublished() {
  return query<any[]>(
    "SELECT np.id, np.title, np.slug, np.excerpt, np.content, np.status, np.created_at, np.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM news_posts np LEFT JOIN users u ON np.author_id = u.id WHERE np.status = 'published' ORDER BY np.created_at DESC",
    []
  );
}

export async function listAdmin() {
  return query<any[]>('SELECT id, title, slug, excerpt, content, status, created_at, updated_at FROM news_posts ORDER BY created_at DESC', []);
}

export async function insertNews(payload: any) {
  return query<any>(
    'INSERT INTO news_posts (title, slug, content, excerpt, author_id, status) VALUES (?, ?, ?, ?, ?, ?)',
    [payload.title, payload.slug, payload.content, payload.excerpt, payload.authorId, payload.status]
  );
}

export async function findById(id: number) {
  const rows = await query<any[]>('SELECT id, title, excerpt, content, status, slug FROM news_posts WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function updateNews(id: number, payload: any) {
  return query<any>('UPDATE news_posts SET title = ?, excerpt = ?, content = ?, status = ? WHERE id = ?', [
    payload.title,
    payload.excerpt,
    payload.content,
    payload.status,
    id,
  ]);
}

export async function deleteNews(id: number) {
  return query<any>('DELETE FROM news_posts WHERE id = ?', [id]);
}

export async function findBySlug(slug: string) {
  const rows = await query<any[]>('SELECT id FROM news_posts WHERE slug = ? LIMIT 1', [slug]);
  return rows && rows[0];
}
