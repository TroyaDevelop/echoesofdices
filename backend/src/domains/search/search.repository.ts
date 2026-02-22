import { query as dbQuery } from '../../db/pool';

export interface SearchResult {
  id: string | number;
  type: 'spell' | 'trait' | 'wondrous' | 'bestiary' | 'article' | 'lore';
  title: string;
  subtitle?: string;
  url: string;
}

export const searchRepository = {
  async searchAll(query: string): Promise<SearchResult[]> {
    const likeQuery = `%${query}%`;
    const results: SearchResult[] = [];

    // Spells
    const spells = await dbQuery<any[]>(
      `SELECT id, name, name_en FROM spells WHERE name LIKE ? OR name_en LIKE ? LIMIT 5`,
      [likeQuery, likeQuery]
    );
    spells.forEach(s => results.push({
      id: s.id,
      type: 'spell',
      title: s.name,
      subtitle: s.name_en,
      url: `/spells/${s.id}`
    }));

    // Traits
    const traits = await dbQuery<any[]>(
      `SELECT id, name, name_en FROM traits WHERE name LIKE ? OR name_en LIKE ? LIMIT 5`,
      [likeQuery, likeQuery]
    );
    traits.forEach(t => results.push({
      id: t.id,
      type: 'trait',
      title: t.name,
      subtitle: t.name_en,
      url: `/traits/${t.id}`
    }));

    // Wondrous Items
    const wondrous = await dbQuery<any[]>(
      `SELECT id, name, name_en FROM wondrous_items WHERE name LIKE ? OR name_en LIKE ? LIMIT 5`,
      [likeQuery, likeQuery]
    );
    wondrous.forEach(w => results.push({
      id: w.id,
      type: 'wondrous',
      title: w.name,
      subtitle: w.name_en,
      url: `/wondrous-items/${w.id}`
    }));

    // Bestiary
    const bestiary = await dbQuery<any[]>(
      `SELECT id, name, name_en FROM bestiary_entries WHERE name LIKE ? OR name_en LIKE ? LIMIT 5`,
      [likeQuery, likeQuery]
    );
    bestiary.forEach(b => results.push({
      id: b.id,
      type: 'bestiary',
      title: b.name,
      subtitle: b.name_en,
      url: `/bestiary/${b.id}`
    }));

    // Articles
    const articles = await dbQuery<any[]>(
      `SELECT slug, title FROM articles WHERE status = 'published' AND title LIKE ? LIMIT 5`,
      [likeQuery]
    );
    articles.forEach(a => results.push({
      id: a.slug,
      type: 'article',
      title: a.title,
      url: `/articles/${a.slug}`
    }));

    // Lore
    const lore = await dbQuery<any[]>(
      `SELECT slug, title FROM lore_articles WHERE status = 'published' AND title LIKE ? LIMIT 5`,
      [likeQuery]
    );
    lore.forEach(l => results.push({
      id: l.slug,
      type: 'lore',
      title: l.title,
      url: `/lore/${l.slug}`
    }));

    return results;
  }
};
