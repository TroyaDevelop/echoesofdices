import { query } from '../../db/pool';

export async function listItems() {
  return query<any[]>(
    'SELECT id, name, category, damage, armor_class, armor_type, weapon_type, short_description, weight, price_cp, price_sp, price_gp, created_at, updated_at FROM market_items ORDER BY name ASC, id ASC',
    []
  );
}

export async function listRegions() {
  return query<any[]>('SELECT id, name, markup_percent, created_at, updated_at FROM market_regions ORDER BY name ASC, id ASC', []);
}

export async function createRegion(name: string) {
  return query<any>('INSERT INTO market_regions (name, markup_percent) VALUES (?, 0)', [name]);
}

export async function updateRegionName(id: number, name: string) {
  await query('UPDATE market_regions SET name = ? WHERE id = ?', [name, id]);
  await query('UPDATE market_items SET region = ? WHERE region_id = ?', [name, id]);
}

export async function deleteRegion(id: number) {
  return query<any>('DELETE FROM market_regions WHERE id = ?', [id]);
}

export async function listMarkups(season: string) {
  return query<any[]>(
    'SELECT m.id, m.region_id, r.name AS region, m.season, m.category, m.markup_percent, m.created_at, m.updated_at FROM market_region_category_markups m JOIN market_regions r ON r.id = m.region_id WHERE m.season = ? ORDER BY r.name ASC, m.category ASC, m.id ASC',
    [season]
  );
}

export async function upsertMarkup(regionId: number, season: string, category: string, markupPercent: number) {
  await query(
    'INSERT INTO market_region_category_markups (region_id, season, category, markup_percent) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE markup_percent = VALUES(markup_percent), updated_at = CURRENT_TIMESTAMP',
    [regionId, season, category, markupPercent]
  );
  const rows = await query<any[]>(
    'SELECT m.id, m.region_id, r.name AS region, m.season, m.category, m.markup_percent, m.created_at, m.updated_at FROM market_region_category_markups m JOIN market_regions r ON r.id = m.region_id WHERE m.region_id = ? AND m.season = ? AND m.category = ? LIMIT 1',
    [regionId, season, category]
  );
  return rows?.[0];
}

export async function findRegionById(id: number) {
  const rows = await query<any[]>('SELECT id, name, markup_percent FROM market_regions WHERE id = ? LIMIT 1', [id]);
  return rows && rows[0];
}

export async function listTradeLogs(limit: number) {
  return query<any[]>(
    'SELECT l.id, l.created_at, l.trade_type, l.roll_mode, l.roll_alt, l.item_id, l.item_name, l.season, l.region_id, r.name AS region_name, l.category, l.markup_percent, l.base_cp, l.roll, l.bonus, l.extra_bonus, l.extra_dice, l.result, l.percent_value, l.final_cp, l.skill_id, l.skill_label, u.login AS user_login, u.nickname AS user_nickname FROM market_trade_logs l LEFT JOIN users u ON u.id = l.user_id LEFT JOIN market_regions r ON r.id = l.region_id ORDER BY l.created_at DESC, l.id DESC LIMIT ?',
    [limit]
  );
}

export async function insertTradeLog(payload: any) {
  return query<any>(
    'INSERT INTO market_trade_logs (user_id, item_id, item_name, trade_type, roll_mode, roll_alt, season, region_id, category, markup_percent, base_cp, roll, bonus, extra_bonus, extra_dice, result, percent_value, final_cp, skill_id, skill_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      payload.user_id,
      payload.item_id,
      payload.item_name,
      payload.trade_type,
      payload.roll_mode,
      payload.roll_alt,
      payload.season,
      payload.region_id,
      payload.category,
      payload.markup_percent,
      payload.base_cp,
      payload.roll,
      payload.bonus,
      payload.extra_bonus,
      payload.extra_dice,
      payload.result,
      payload.percent_value,
      payload.final_cp,
      payload.skill_id,
      payload.skill_label,
    ]
  );
}

export async function findTradeLogById(id: number) {
  const rows = await query<any[]>(
    'SELECT l.id, l.created_at, l.trade_type, l.roll_mode, l.roll_alt, l.item_id, l.item_name, l.season, l.region_id, r.name AS region_name, l.category, l.markup_percent, l.base_cp, l.roll, l.bonus, l.extra_bonus, l.extra_dice, l.result, l.percent_value, l.final_cp, l.skill_id, l.skill_label, u.login AS user_login, u.nickname AS user_nickname FROM market_trade_logs l LEFT JOIN users u ON u.id = l.user_id LEFT JOIN market_regions r ON r.id = l.region_id WHERE l.id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function insertItem(payload: any) {
  return query<any>(
    'INSERT INTO market_items (name, category, damage, armor_class, armor_type, weapon_type, short_description, weight, region_id, region, price_gp, price_sp, price_cp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)',
    [
      payload.name,
      payload.category,
      payload.damage,
      payload.armor_class,
      payload.armor_type,
      payload.weapon_type,
      payload.short_description,
      payload.weight,
      payload.price_gp,
      payload.price_sp,
      payload.price_cp,
    ]
  );
}

export async function findItemById(id: number) {
  const rows = await query<any[]>(
    'SELECT id, name, category, damage, armor_class, armor_type, weapon_type, short_description, weight, price_gp, price_sp, price_cp FROM market_items WHERE id = ? LIMIT 1',
    [id]
  );
  return rows && rows[0];
}

export async function updateItem(id: number, payload: any) {
  return query<any>(
    'UPDATE market_items SET name = ?, category = ?, damage = ?, armor_class = ?, armor_type = ?, weapon_type = ?, short_description = ?, weight = ?, region_id = NULL, region = NULL, price_gp = ?, price_sp = ?, price_cp = ? WHERE id = ?',
    [
      payload.name,
      payload.category,
      payload.damage,
      payload.armor_class,
      payload.armor_type,
      payload.weapon_type,
      payload.short_description,
      payload.weight,
      payload.price_gp,
      payload.price_sp,
      payload.price_cp,
      id,
    ]
  );
}

export async function deleteItem(id: number) {
  return query<any>('DELETE FROM market_items WHERE id = ?', [id]);
}

export async function createDefaultMarkups(regionId: number, categories: string[]) {
  for (const cat of categories) {
    await query(
      "INSERT IGNORE INTO market_region_category_markups (region_id, season, category, markup_percent) VALUES (?, 'spring_summer', ?, 0)",
      [regionId, cat]
    );
    await query(
      "INSERT IGNORE INTO market_region_category_markups (region_id, season, category, markup_percent) VALUES (?, 'autumn_winter', ?, 0)",
      [regionId, cat]
    );
  }
}
