import { HttpError } from '../../utils/httpError';
import {
  deleteBestiaryEntry,
  findBestiaryEntryById,
  insertBestiaryEntry,
  listBestiaryEntries,
  listBestiaryEntriesAdmin,
  updateBestiaryEntry,
} from './bestiary.repository';

const toTrimmed = (value: any) => {
  if (value === undefined || value === null) return null;
  const next = String(value).trim();
  return next ? next : null;
};

const toOptionalAbility = (value: any) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const clamped = Math.max(1, Math.min(30, Math.round(num)));
  return clamped;
};

const toFlag = (value: any) => value === true || value === 1 || String(value).toLowerCase() === 'true';

const normalizeEntryPayload = (body: any, fallback?: any) => {
  const name = body?.name !== undefined ? String(body.name).trim() : String(fallback?.name || '').trim();
  if (!name) throw new HttpError(400, 'Название монстра обязательно');

  return {
    name,
    name_en: body?.name_en !== undefined ? toTrimmed(body.name_en) : fallback?.name_en ?? null,
    size: body?.size !== undefined ? toTrimmed(body.size) : fallback?.size ?? null,
    creature_type: body?.creature_type !== undefined ? toTrimmed(body.creature_type) : fallback?.creature_type ?? null,
    alignment: body?.alignment !== undefined ? toTrimmed(body.alignment) : fallback?.alignment ?? null,
    habitat: body?.habitat !== undefined ? toTrimmed(body.habitat) : fallback?.habitat ?? null,
    is_hidden: body?.is_hidden !== undefined ? toFlag(body.is_hidden) : Boolean(fallback?.is_hidden),
    armor_class: body?.armor_class !== undefined ? toTrimmed(body.armor_class) : fallback?.armor_class ?? null,
    hit_points: body?.hit_points !== undefined ? toTrimmed(body.hit_points) : fallback?.hit_points ?? null,
    speed: body?.speed !== undefined ? toTrimmed(body.speed) : fallback?.speed ?? null,
    strength: body?.strength !== undefined ? toOptionalAbility(body.strength) : fallback?.strength ?? null,
    dexterity: body?.dexterity !== undefined ? toOptionalAbility(body.dexterity) : fallback?.dexterity ?? null,
    constitution: body?.constitution !== undefined ? toOptionalAbility(body.constitution) : fallback?.constitution ?? null,
    intelligence: body?.intelligence !== undefined ? toOptionalAbility(body.intelligence) : fallback?.intelligence ?? null,
    wisdom: body?.wisdom !== undefined ? toOptionalAbility(body.wisdom) : fallback?.wisdom ?? null,
    charisma: body?.charisma !== undefined ? toOptionalAbility(body.charisma) : fallback?.charisma ?? null,
    saving_throws: body?.saving_throws !== undefined ? toTrimmed(body.saving_throws) : fallback?.saving_throws ?? null,
    skills: body?.skills !== undefined ? toTrimmed(body.skills) : fallback?.skills ?? null,
    damage_vulnerabilities:
      body?.damage_vulnerabilities !== undefined ? toTrimmed(body.damage_vulnerabilities) : fallback?.damage_vulnerabilities ?? null,
    damage_resistances: body?.damage_resistances !== undefined ? toTrimmed(body.damage_resistances) : fallback?.damage_resistances ?? null,
    damage_immunities: body?.damage_immunities !== undefined ? toTrimmed(body.damage_immunities) : fallback?.damage_immunities ?? null,
    condition_immunities: body?.condition_immunities !== undefined ? toTrimmed(body.condition_immunities) : fallback?.condition_immunities ?? null,
    senses: body?.senses !== undefined ? toTrimmed(body.senses) : fallback?.senses ?? null,
    languages: body?.languages !== undefined ? toTrimmed(body.languages) : fallback?.languages ?? null,
    challenge_rating: body?.challenge_rating !== undefined ? toTrimmed(body.challenge_rating) : fallback?.challenge_rating ?? null,
    proficiency_bonus: body?.proficiency_bonus !== undefined ? toTrimmed(body.proficiency_bonus) : fallback?.proficiency_bonus ?? null,
    source: body?.source !== undefined ? toTrimmed(body.source) : fallback?.source ?? null,
    source_pages: body?.source_pages !== undefined ? toTrimmed(body.source_pages) : fallback?.source_pages ?? null,
    traits_text: body?.traits_text !== undefined ? toTrimmed(body.traits_text) : fallback?.traits_text ?? null,
    actions_text: body?.actions_text !== undefined ? toTrimmed(body.actions_text) : fallback?.actions_text ?? null,
    reactions_text: body?.reactions_text !== undefined ? toTrimmed(body.reactions_text) : fallback?.reactions_text ?? null,
    legendary_actions_text:
      body?.legendary_actions_text !== undefined ? toTrimmed(body.legendary_actions_text) : fallback?.legendary_actions_text ?? null,
    spellcasting_text: body?.spellcasting_text !== undefined ? toTrimmed(body.spellcasting_text) : fallback?.spellcasting_text ?? null,
    villain_actions_text:
      body?.villain_actions_text !== undefined ? toTrimmed(body.villain_actions_text) : fallback?.villain_actions_text ?? null,
    description: body?.description !== undefined ? toTrimmed(body.description) : fallback?.description ?? null,
  };
};

export async function listBestiaryPublic(includeHidden = false) {
  return listBestiaryEntries(includeHidden);
}

export async function listBestiaryAdminData() {
  return listBestiaryEntriesAdmin();
}

export async function getBestiaryById(id: number, includeHidden = false) {
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id');
  const row = await findBestiaryEntryById(id, includeHidden);
  if (!row) throw new HttpError(404, 'Монстр не найден');
  return row;
}

export async function createBestiaryEntryRecord(body: any) {
  const payload = normalizeEntryPayload(body);
  const result = await insertBestiaryEntry(payload);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, ...payload };
}

export async function updateBestiaryEntryRecord(id: number, body: any) {
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id');
  const existing = await findBestiaryEntryById(id);
  if (!existing) throw new HttpError(404, 'Монстр не найден');

  const payload = normalizeEntryPayload(body, existing);
  await updateBestiaryEntry(id, payload);
  return { id, ...payload };
}

export async function deleteBestiaryEntryRecord(id: number) {
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id');
  await deleteBestiaryEntry(id);
  return { message: 'Монстр удален' };
}