export const allowedSpellThemes = new Set([
  'none',
  'fire',
  'cold',
  'lightning',
  'acid',
  'poison',
  'necrotic',
  'radiant',
  'psychic',
  'force',
  'thunder',
]);

export function normalizeSpellTheme(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return 'none';
  const s = String(value).trim().toLowerCase();
  if (!s) return 'none';
  return allowedSpellThemes.has(s) ? s : 'none';
}

export function normalizeSkillValue(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  const lvl = Math.trunc(n);
  if (lvl < 0 || lvl > 2) return undefined;
  return lvl;
}

export function normalizeAbilityScore(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  const v = Math.trunc(n);
  if (v < 1 || v > 30) return undefined;
  return v;
}

export function normalizeLevel(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  const v = Math.trunc(n);
  if (v < 1 || v > 20) return undefined;
  return v;
}

export function normalizeLoreYear(value: unknown, fallback: number | null = null): number | null {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export function normalizeLoreLocations(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const raw = String(value || '')
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  if (raw.length === 0) return null;
  return raw.join(', ');
}

export function toNonNegInt(value: unknown, fallback: number | null = 0): number | null {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export function toNonNegFloat(value: unknown, fallback: number | null = null): number | null {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function toInt(value: unknown, fallback: number | null = 0): number | null {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export function toMarkupPercent(value: unknown, fallback: number | null = 0): number | null {
  const n = toInt(value, fallback);
  if (n === null || n < 0 || n > 1000) return null;
  return n;
}

export function toIntInRange(value: unknown, min: number, max: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const v = Math.trunc(n);
  if (v < min || v > max) return null;
  return v;
}

export function toPercentValue(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 1) return null;
  return Math.round(n * 10000) / 10000;
}

export function normOpt(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const s = String(value).trim();
  return s ? s : null;
}

export const MARKET_CATEGORIES: Record<string, string> = {
  nonmetal_weapon_armor: 'Неметаллическое оружие и броня',
  food_plant: 'Еда растительная',
  food_meat: 'Еда мясная',
  metal_weapon_armor: 'Металлическое оружие и броня',
  vehicles: 'Транспортные средства',
  draft_animals: 'Тягловые животные',
  riding_animals: 'Верховые животные',
  nonmetal_goods: 'Неметаллические изделия',
  metal_goods: 'Металлические изделия',
  textile_goods: 'Текстильные изделия',
  tools: 'Инструменты',
  complex_goods: 'Сложные изделия',
  magic_goods: 'Магические изделия',
  jewelry_goods: 'Ювелирные изделия',
  alchemy_goods_ingredients: 'Алхимические изделия и ингредиенты',
};

export const MARKET_SEASONS: Record<string, string> = {
  spring_summer: 'Весна-лето',
  autumn_winter: 'Осень-зима',
};

export const WEAPON_TYPES: Record<string, string> = {
  simple_melee: 'Простое рукопашное',
  simple_ranged: 'Простое дальнобойное',
  martial_melee: 'Воинское рукопашное',
  martial_ranged: 'Воинское дальнобойное',
};

export const ARMOR_TYPES: Record<string, string> = {
  light: 'Легкий',
  medium: 'Средний',
  heavy: 'Тяжелый',
};

export function normalizeMarketCategory(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return MARKET_CATEGORIES[s] ? s : null;
}

export function normalizeMarketSeason(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return 'spring_summer';
  const s = String(value).trim();
  if (!s) return 'spring_summer';
  return MARKET_SEASONS[s] ? s : null;
}

export function normalizeWeaponType(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return WEAPON_TYPES[s] ? s : null;
}

export function normalizeArmorType(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return ARMOR_TYPES[s] ? s : null;
}

export function normalizeTradeType(value: unknown): 'sell' | 'buy' | null {
  if (value === undefined || value === null || value === '') return null;
  const s = String(value).trim().toLowerCase();
  if (s === 'sell' || s === 'buy') return s;
  return null;
}

export const normalizeWondrousRarity = (value: unknown): string => String(value || '').trim().toLowerCase();
export const isValidWondrousRarity = (value: unknown): boolean =>
  ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact'].includes(normalizeWondrousRarity(value));

export const toBool = (value: unknown): boolean => value === true || value === 'true' || value === 1 || value === '1';

export const marketSupportsCombatFields = (category: string | null | undefined): boolean =>
  category === 'nonmetal_weapon_armor' || category === 'metal_weapon_armor';
