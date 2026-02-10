import { query } from '../../db/pool';

export async function listPublished() {
  return query<any[]>(
    "SELECT l.id, l.title, l.slug, l.year, l.locations, l.excerpt, l.content, l.status, l.created_at, l.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM lore_articles l LEFT JOIN users u ON l.author_id = u.id WHERE l.status = 'published' ORDER BY l.year DESC, l.created_at DESC",
    []
  );
}

export async function listAdmin() {
  return query<any[]>('SELECT id, title, slug, year, locations, excerpt, content, status, created_at, updated_at FROM lore_articles ORDER BY year DESC, created_at DESC', []);
}

export async function listLocations() {
  return query<any[]>('SELECT id, name FROM lore_locations ORDER BY name ASC', []);
}

export async function insertLocation(name: string) {
  return query<any>('INSERT INTO lore_locations (name) VALUES (?)', [name]);
}

export async function deleteLocation(id: number) {
  return query<any>('DELETE FROM lore_locations WHERE id = ?', [id]);
}

export async function findBySlug(slug: string) {
  const rows = await query<any[]>(
    "SELECT l.id, l.title, l.slug, l.year, l.locations, l.excerpt, l.content, l.status, l.created_at, l.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM lore_articles l LEFT JOIN users u ON l.author_id = u.id WHERE l.slug = ? AND l.status = 'published' LIMIT 1",
    [slug]
  );
  return rows && rows[0];
}

export async function findById(id: number) {
  const rows = await query<any[]>('SELECT id, title, excerpt, content, status, slug, year, locations FROM lore_articles WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function findSlug(slug: string) {
  const rows = await query<any[]>('SELECT id FROM lore_articles WHERE slug = ? LIMIT 1', [slug]);
  return rows && rows[0];
}

export async function insertLore(payload: any) {
  return query<any>(
    'INSERT INTO lore_articles (title, slug, year, locations, content, excerpt, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [payload.title, payload.slug, payload.year, payload.locations, payload.content, payload.excerpt, payload.authorId, payload.status]
  );
}

export async function updateLore(id: number, payload: any) {
  return query<any>('UPDATE lore_articles SET title = ?, excerpt = ?, content = ?, status = ?, year = ?, locations = ? WHERE id = ?', [
    payload.title,
    payload.excerpt,
    payload.content,
    payload.status,
    payload.year,
    payload.locations,
    id,
  ]);
}

export async function deleteLore(id: number) {
  return query<any>('DELETE FROM lore_articles WHERE id = ?', [id]);
}
