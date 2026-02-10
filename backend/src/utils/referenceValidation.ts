import { query } from '../db/pool';

const normalizeClassKey = (value: string) => String(value || '').trim().toLowerCase();
const splitClassTokens = (value: unknown) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

export async function validateClassesExist(value: unknown): Promise<string[]> {
  const tokens = splitClassTokens(value);
  if (tokens.length === 0) return [];

  const rows = await query<any[]>('SELECT name FROM spell_classes', []);
  const known = new Set((rows || []).map((row) => normalizeClassKey(row.name)));
  return tokens.filter((token) => !known.has(normalizeClassKey(token)));
}

const normalizeSourceKey = (value: string) => String(value || '').trim().toLowerCase();
const splitSourceTokens = (value: unknown) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

export async function validateSourcesExist(value: unknown): Promise<string[]> {
  const tokens = splitSourceTokens(value);
  if (tokens.length === 0) return [];

  const rows = await query<any[]>('SELECT name FROM sources', []);
  const known = new Set((rows || []).map((row) => normalizeSourceKey(row.name)));
  return tokens.filter((token) => !known.has(normalizeSourceKey(token)));
}
