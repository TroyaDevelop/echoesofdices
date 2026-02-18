import { HttpError } from '../../utils/httpError';
import path from 'path';
import { promises as fsPromises } from 'fs';
import {
  deleteEncounterById,
  findEncounterById,
  insertEncounter,
  insertEncounterEvent,
  listBestiaryByIds,
  listEncountersRows,
  setEncounterStarted,
  updateEncounter,
  updateEncounterInitiativeOrder,
  updateEncounterMapConfig,
  updateEncounterMapTokens,
  updateEncounterMonsters,
} from './screen.repository';

type EncounterMonster = {
  monster_instance_id: string;
  participant_type: 'monster' | 'player';
  bestiary_id: number;
  name: string;
  name_en: string | null;
  size: string | null;
  creature_type: string | null;
  alignment: string | null;
  armor_class: string | null;
  hit_points: string | null;
  hp_current: number | null;
  speed: string | null;
  strength: number | null;
  dexterity: number | null;
  constitution: number | null;
  intelligence: number | null;
  wisdom: number | null;
  charisma: number | null;
  saving_throws: string | null;
  skills: string | null;
  damage_vulnerabilities: string | null;
  damage_resistances: string | null;
  damage_immunities: string | null;
  condition_immunities: string | null;
  senses: string | null;
  languages: string | null;
  challenge_rating: string | null;
  proficiency_bonus: string | null;
  source: string | null;
  source_pages: string | null;
  traits_text: string | null;
  actions_text: string | null;
  reactions_text: string | null;
  legendary_actions_text: string | null;
  spellcasting_text: string | null;
  villain_actions_text: string | null;
  description: string | null;
  initiative_custom: number | null;
  initiative_roll: number | null;
  initiative_total: number | null;
  dex_mod: number;
};

type InitiativeRow = {
  monster_instance_id: string;
  participant_type: 'monster' | 'player';
  name: string;
  initiative_roll: number;
  dex_mod: number;
  initiative_total: number;
};

type TacticalMapToken = {
  token_id: string;
  linked_monster_instance_id: string | null;
  name: string;
  image_url: string | null;
  x: number;
  y: number;
  size_cells: number;
  label_text: string | null;
  font_family: string | null;
  font_size: number;
};

const makeInitiativeOrder = (participants: EncounterMonster[]) => {
  return participants
    .filter((participant) => Number.isFinite(Number(participant.initiative_total)))
    .map((participant) => {
      const participantType = (participant.participant_type === 'player' ? 'player' : 'monster') as 'player' | 'monster';
      const rawRoll = Number(participant.initiative_roll);
      const initiativeRoll = Number.isFinite(rawRoll)
        ? clamp(Math.trunc(rawRoll), 1, 20)
        : 1;
      return {
        monster_instance_id: participant.monster_instance_id,
        participant_type: participantType,
        name: participant.name,
        initiative_roll: initiativeRoll,
        dex_mod: Number(participant.dex_mod || 0),
        initiative_total: Number(participant.initiative_total || 0),
      };
    })
    .sort((a, b) => {
      if (b.initiative_total !== a.initiative_total) return b.initiative_total - a.initiative_total;
      if (b.dex_mod !== a.dex_mod) return b.dex_mod - a.dex_mod;
      return a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' });
    });
};

const toInt = (value: unknown): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.trunc(num);
};

const toOptString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const next = String(value).trim();
  return next || null;
};

const abilityMod = (scoreRaw: unknown) => {
  const score = Number(scoreRaw);
  if (!Number.isFinite(score)) return 0;
  return Math.floor((score - 10) / 2);
};

const parseHpText = (hitPoints: string | null) => {
  const raw = String(hitPoints || '').trim();
  if (!raw) return null;
  const match = raw.match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.trunc(parsed);
};

const parseJsonArray = (value: unknown) => {
  if (!value) return [] as any[];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeGridSizeFt = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return clamp(Math.trunc(num), 1, 30);
};

const normalizeGridOpacity = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.35;
  return Math.round(clamp(num, 0.05, 1) * 100) / 100;
};

const normalizeGridDashed = (value: unknown) => {
  if (value === true || value === 1) return true;
  const text = String(value ?? '').trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes' || text === 'on';
};

const normalizeMapViewDataUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length > 12_000_000) return null;
  const match = raw.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  return raw;
};

const randomTokenId = () => `t_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

const normalizeMapTokens = (tokensRaw: unknown): TacticalMapToken[] => {
  const source = Array.isArray(tokensRaw) ? tokensRaw : [];
  return source.map((token) => {
    const tokenId = String((token as any)?.token_id || randomTokenId()).trim() || randomTokenId();
    const linkedMonsterInstanceIdRaw = (token as any)?.linked_monster_instance_id;
    const linkedMonsterInstanceId = linkedMonsterInstanceIdRaw ? String(linkedMonsterInstanceIdRaw).trim() : null;
    const name = String((token as any)?.name || '').trim();
    const imageUrl = (token as any)?.image_url ? String((token as any).image_url).trim() : null;
    const xRaw = Number((token as any)?.x ?? 0);
    const yRaw = Number((token as any)?.y ?? 0);
    const sizeRaw = Number((token as any)?.size_cells ?? 1);
    const fontSizeRaw = Number((token as any)?.font_size ?? 14);
    return {
      token_id: tokenId,
      linked_monster_instance_id: linkedMonsterInstanceId && linkedMonsterInstanceId.length > 0 ? linkedMonsterInstanceId : null,
      name,
      image_url: imageUrl && imageUrl.length > 0 ? imageUrl : null,
      x: Number.isFinite(xRaw) ? clamp(Math.trunc(xRaw), 0, 400) : 0,
      y: Number.isFinite(yRaw) ? clamp(Math.trunc(yRaw), 0, 400) : 0,
      size_cells: Number.isFinite(sizeRaw) ? clamp(Math.trunc(sizeRaw), 1, 12) : 1,
      label_text: (token as any)?.label_text ? String((token as any).label_text).trim() || null : null,
      font_family: (token as any)?.font_family ? String((token as any).font_family).trim() || null : null,
      font_size: Number.isFinite(fontSizeRaw) ? clamp(Math.trunc(fontSizeRaw), 8, 64) : 14,
    };
  });
};

const extractUploadRelativePath = (urlLike: string | null): string | null => {
  if (!urlLike) return null;
  const marker = '/uploads/';
  const idx = urlLike.indexOf(marker);
  if (idx < 0) return null;
  const relative = urlLike.slice(idx + 1);
  if (!relative) return null;
  return relative;
};

const resolveUploadAbsolutePath = (urlLike: string | null): string | null => {
  const relative = extractUploadRelativePath(urlLike);
  if (!relative) return null;
  return path.join(__dirname, '..', '..', '..', 'uploads', relative.replace(/^uploads\//, ''));
};

const normalizeEncounterName = (nameRaw: unknown) => {
  const value = String(nameRaw || '').trim();
  if (!value) throw new HttpError(400, 'Название энкаунтера обязательно');
  if (value.length > 255) throw new HttpError(400, 'Название энкаунтера слишком длинное');
  return value;
};

const randomId = () => `m_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

const buildSnapshot = (row: any): EncounterMonster => {
  const hpText = toOptString(row.hit_points);
  const dexterity = toInt(row.dexterity);
  return {
    monster_instance_id: randomId(),
    participant_type: 'monster',
    bestiary_id: Number(row.id),
    name: String(row.name || `#${row.id}`),
    name_en: toOptString(row.name_en),
    size: toOptString(row.size),
    creature_type: toOptString(row.creature_type),
    alignment: toOptString(row.alignment),
    armor_class: toOptString(row.armor_class),
    hit_points: hpText,
    hp_current: parseHpText(hpText),
    speed: toOptString(row.speed),
    strength: toInt(row.strength),
    dexterity,
    constitution: toInt(row.constitution),
    intelligence: toInt(row.intelligence),
    wisdom: toInt(row.wisdom),
    charisma: toInt(row.charisma),
    saving_throws: toOptString(row.saving_throws),
    skills: toOptString(row.skills),
    damage_vulnerabilities: toOptString(row.damage_vulnerabilities),
    damage_resistances: toOptString(row.damage_resistances),
    damage_immunities: toOptString(row.damage_immunities),
    condition_immunities: toOptString(row.condition_immunities),
    senses: toOptString(row.senses),
    languages: toOptString(row.languages),
    challenge_rating: toOptString(row.challenge_rating),
    proficiency_bonus: toOptString(row.proficiency_bonus),
    source: toOptString(row.source),
    source_pages: toOptString(row.source_pages),
    traits_text: toOptString(row.traits_text),
    actions_text: toOptString(row.actions_text),
    reactions_text: toOptString(row.reactions_text),
    legendary_actions_text: toOptString(row.legendary_actions_text),
    spellcasting_text: toOptString(row.spellcasting_text),
    villain_actions_text: toOptString(row.villain_actions_text),
    description: toOptString(row.description),
    initiative_custom: null,
    initiative_roll: null,
    initiative_total: null,
    dex_mod: abilityMod(dexterity),
  };
};

const readEntries = (entriesRaw: unknown) => {
  const entries = Array.isArray(entriesRaw) ? entriesRaw : [];
  const normalized: Array<{ bestiary_id: number; count: number }> = [];

  for (const entry of entries) {
    const id = Number((entry as any)?.bestiary_id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const countRaw = Number((entry as any)?.count ?? 1);
    const count = Number.isFinite(countRaw) ? Math.min(Math.max(Math.trunc(countRaw), 1), 30) : 1;
    normalized.push({ bestiary_id: Math.trunc(id), count });
  }

  if (!normalized.length) throw new HttpError(400, 'Добавьте хотя бы одно существо');
  return normalized;
};

async function expandEntriesToMonsters(entriesRaw: unknown) {
  const entries = readEntries(entriesRaw);
  const ids = Array.from(new Set(entries.map((entry) => entry.bestiary_id)));
  const rows = await listBestiaryByIds(ids);
  const map = new Map(rows.map((row: any) => [Number(row.id), row]));

  const monsters: EncounterMonster[] = [];
  for (const entry of entries) {
    const source = map.get(entry.bestiary_id);
    if (!source) throw new HttpError(404, `Существо #${entry.bestiary_id} не найдено в бестиарии`);
    for (let i = 0; i < entry.count; i += 1) {
      monsters.push(buildSnapshot(source));
    }
  }

  return monsters;
}

const normalizePlayers = (playersRaw: unknown): EncounterMonster[] => {
  const players = Array.isArray(playersRaw) ? playersRaw : [];
  const normalized: EncounterMonster[] = [];

  for (const player of players) {
    const name = String((player as any)?.name || '').trim();
    if (!name) continue;

    const initiativeRaw = Number((player as any)?.initiative);
    if (!Number.isFinite(initiativeRaw)) throw new HttpError(400, `Для игрока "${name}" укажите инициативу числом`);
    const initiative = Math.trunc(initiativeRaw);

    const hpRaw = (player as any)?.hp_current;
    const hpNumber = hpRaw === '' || hpRaw === null || hpRaw === undefined ? null : Number(hpRaw);
    if (hpRaw !== '' && hpRaw !== null && hpRaw !== undefined && !Number.isFinite(hpNumber)) {
      throw new HttpError(400, `Для игрока "${name}" HP должен быть числом`);
    }

    normalized.push({
      monster_instance_id: randomId(),
      participant_type: 'player',
      bestiary_id: 0,
      name,
      name_en: null,
      size: null,
      creature_type: 'Игрок',
      alignment: null,
      armor_class: toOptString((player as any)?.armor_class),
      hit_points: null,
      hp_current: hpNumber === null ? null : Math.max(Math.trunc(hpNumber), 0),
      speed: null,
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
      saving_throws: null,
      skills: null,
      damage_vulnerabilities: null,
      damage_resistances: null,
      damage_immunities: null,
      condition_immunities: null,
      senses: null,
      languages: null,
      challenge_rating: null,
      proficiency_bonus: null,
      source: null,
      source_pages: null,
      traits_text: null,
      actions_text: null,
      reactions_text: null,
      legendary_actions_text: null,
      spellcasting_text: null,
      villain_actions_text: null,
      description: null,
      initiative_custom: initiative,
      initiative_roll: null,
      initiative_total: initiative,
      dex_mod: 0,
    });
  }

  return normalized;
};

async function buildEncounterParticipants(body: any) {
  const monsters = await expandEntriesToMonsters(body?.entries);
  const players = normalizePlayers(body?.players);
  const participants = [...players, ...monsters];
  if (!participants.length) throw new HttpError(400, 'Добавьте хотя бы одного участника');
  return participants;
}

const deserializeEncounter = (row: any) => {
  const monsters = parseJsonArray(row?.monsters_json) as EncounterMonster[];
  const initiativeOrder = parseJsonArray(row?.initiative_order_json) as InitiativeRow[];
  const mapTokens = normalizeMapTokens(parseJsonArray(row?.map_tokens_json));

  return {
    id: Number(row.id),
    name: String(row.name || ''),
    status: String(row.status || 'draft'),
    master_name: toOptString(row.master_name),
    started_by: row.started_by === null || row.started_by === undefined ? null : Number(row.started_by),
    started_at: row.started_at || null,
    monsters,
    monster_count: monsters.length,
    initiative_order: initiativeOrder,
    map_image_url: toOptString(row.map_image_url),
    map_grid_size_ft: normalizeGridSizeFt(row.map_grid_size_ft),
    map_grid_opacity: normalizeGridOpacity(row.map_grid_opacity),
    map_grid_dashed: normalizeGridDashed(row.map_grid_dashed),
    map_tokens: mapTokens,
    created_by: Number(row.created_by),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export async function listScreenEncounters(limitRaw: unknown) {
  const limitValue = Number(limitRaw || 100);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 300) : 100;
  const rows = await listEncountersRows(limit);
  return (rows || []).map(deserializeEncounter);
}

export async function getScreenEncounterById(idRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');
  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');
  return deserializeEncounter(row);
}

export async function createScreenEncounter(body: any, userIdRaw: unknown) {
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) throw new HttpError(401, 'Требуется авторизация');

  const name = normalizeEncounterName(body?.name);
  const participants = await buildEncounterParticipants(body || {});
  const result = await insertEncounter(name, JSON.stringify(participants), Math.trunc(userId));
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
  return getScreenEncounterById(insertedId);
}

export async function updateScreenEncounter(idRaw: unknown, body: any) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const existing = await findEncounterById(Math.trunc(id));
  if (!existing) throw new HttpError(404, 'Энкаунтер не найден');

  const name = normalizeEncounterName(body?.name ?? existing.name);
  const participants = await buildEncounterParticipants(body || {});

  const existingEncounter = deserializeEncounter(existing);
  const isActive = existingEncounter.status === 'active';

  let nextParticipants = participants;
  let nextInitiativeOrder: InitiativeRow[] = [];

  if (isActive) {
    const pools = new Map<string, Array<{ initiative_total: number | null; initiative_roll: number | null; dex_mod: number }>>();

    for (const prev of existingEncounter.monsters) {
      const key = `${prev.participant_type === 'player' ? 'player' : 'monster'}|${Number(prev.bestiary_id || 0)}|${String(prev.name || '').trim()}`;
      if (!pools.has(key)) pools.set(key, []);
      pools.get(key)!.push({
        initiative_total: Number.isFinite(Number(prev.initiative_total)) ? Number(prev.initiative_total) : null,
        initiative_roll: Number.isFinite(Number(prev.initiative_roll)) ? Number(prev.initiative_roll) : null,
        dex_mod: Number.isFinite(Number(prev.dex_mod)) ? Number(prev.dex_mod) : 0,
      });
    }

    nextParticipants = participants.map((participant) => {
      if (participant.participant_type === 'player') {
        const custom = Number(participant.initiative_custom);
        const customValue = Number.isFinite(custom) ? Math.trunc(custom) : 0;
        return {
          ...participant,
          initiative_custom: customValue,
          initiative_total: customValue,
          initiative_roll: null,
          dex_mod: 0,
        };
      }

      const key = `monster|${Number(participant.bestiary_id || 0)}|${String(participant.name || '').trim()}`;
      const pool = pools.get(key) || [];
      const restored = pool.shift();
      if (pool.length > 0) pools.set(key, pool);
      else pools.delete(key);

      if (!restored || restored.initiative_total === null) {
        return {
          ...participant,
          initiative_roll: null,
          initiative_total: null,
        };
      }

      return {
        ...participant,
        initiative_roll: restored.initiative_roll,
        initiative_total: restored.initiative_total,
        dex_mod: restored.dex_mod,
      };
    });

    nextInitiativeOrder = makeInitiativeOrder(nextParticipants);
  }

  await updateEncounter(
    Math.trunc(id),
    name,
    JSON.stringify(nextParticipants),
    isActive ? 'active' : 'draft',
    isActive ? JSON.stringify(nextInitiativeOrder) : null
  );

  return getScreenEncounterById(id);
}

export async function startScreenEncounter(idRaw: unknown, startedByRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const startedBy = Number(startedByRaw);
  if (!Number.isFinite(startedBy) || startedBy <= 0) throw new HttpError(401, 'Требуется авторизация');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  if (!encounter.monsters.length) throw new HttpError(400, 'В энкаунтере нет существ');

  const withInitiative = encounter.monsters.map((monster) => {
    const participantType = monster.participant_type === 'player' ? 'player' : 'monster';
    if (participantType === 'player') {
      const totalRaw = Number(monster.initiative_custom ?? monster.initiative_total ?? 0);
      const total = Number.isFinite(totalRaw) ? Math.trunc(totalRaw) : 0;
      return {
        ...monster,
        participant_type: 'player' as const,
        dex_mod: 0,
        initiative_custom: total,
        initiative_roll: null,
        initiative_total: total,
      };
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    const dexMod = abilityMod(monster.dexterity);
    const total = roll + dexMod;
    return {
      ...monster,
      participant_type: 'monster' as const,
      initiative_custom: null,
      dex_mod: dexMod,
      initiative_roll: roll,
      initiative_total: total,
    };
  });

  const initiativeOrder: InitiativeRow[] = makeInitiativeOrder(withInitiative);

  await setEncounterStarted(Math.trunc(id), JSON.stringify(withInitiative), JSON.stringify(initiativeOrder), Math.trunc(startedBy));

  await insertEncounterEvent(Math.trunc(id), {
    encounter_id: Math.trunc(id),
    encounter_name: encounter.name,
    order: initiativeOrder,
    map_image_url: encounter.map_image_url,
    map_grid_size_ft: encounter.map_grid_size_ft,
    map_grid_opacity: encounter.map_grid_opacity,
    map_grid_dashed: encounter.map_grid_dashed,
    map_tokens: encounter.map_tokens,
    started_at: new Date().toISOString(),
  });

  return getScreenEncounterById(id);
}

export async function finishScreenEncounter(idRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Сессия боя не найдена');

  const encounter = deserializeEncounter(row);

  const fileCandidates = new Set<string>();
  const mapPath = resolveUploadAbsolutePath(encounter.map_image_url);
  if (mapPath) fileCandidates.add(mapPath);

  for (const token of encounter.map_tokens || []) {
    const tokenPath = resolveUploadAbsolutePath(token?.image_url || null);
    if (tokenPath) fileCandidates.add(tokenPath);
  }

  for (const participant of encounter.monsters || []) {
    const maybeUrl = toOptString((participant as any)?.image_url);
    const participantPath = resolveUploadAbsolutePath(maybeUrl);
    if (participantPath) fileCandidates.add(participantPath);
  }

  for (const filePath of Array.from(fileCandidates)) {
    try {
      await fsPromises.unlink(filePath);
    } catch {
      // ignore missing files
    }
  }

  await deleteEncounterById(Math.trunc(id));

  return { message: 'Бой завершен' };
}

export async function updateScreenEncounterMapConfig(idRaw: unknown, input: any, mapImageUrl?: string | null) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');
  const encounter = deserializeEncounter(row);

  const nextImageUrl = mapImageUrl === undefined ? encounter.map_image_url : mapImageUrl;
  const gridSizeFt = normalizeGridSizeFt(input?.grid_size_ft ?? encounter.map_grid_size_ft);
  const gridOpacity = normalizeGridOpacity(input?.grid_opacity ?? encounter.map_grid_opacity);
  const gridDashed = normalizeGridDashed(input?.grid_dashed ?? encounter.map_grid_dashed);

  const previousImagePath = resolveUploadAbsolutePath(encounter.map_image_url);
  const nextImagePath = resolveUploadAbsolutePath(nextImageUrl || null);
  const imageChanged = previousImagePath && nextImagePath && previousImagePath !== nextImagePath;

  await updateEncounterMapConfig(Math.trunc(id), nextImageUrl || null, gridSizeFt, gridOpacity, gridDashed);

  if (imageChanged && previousImagePath) {
    try {
      await fsPromises.unlink(previousImagePath);
    } catch {
      // ignore missing files
    }
  }

  return getScreenEncounterById(id);
}

export async function updateScreenEncounterMapTokens(idRaw: unknown, tokensRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  const nextTokens = normalizeMapTokens(tokensRaw);

  const allowedMonsterIds = new Set((encounter.monsters || []).map((monster) => String(monster.monster_instance_id)));
  const validatedTokens = nextTokens.map((token) => {
    if (!token.linked_monster_instance_id) return token;
    if (!allowedMonsterIds.has(String(token.linked_monster_instance_id))) {
      return { ...token, linked_monster_instance_id: null };
    }
    return token;
  });

  const previousTokens = normalizeMapTokens(encounter.map_tokens || []);
  const nextTokenIds = new Set(validatedTokens.map((token) => token.token_id));
  const removedTokenImagePaths = previousTokens
    .filter((token) => !nextTokenIds.has(token.token_id))
    .map((token) => resolveUploadAbsolutePath(token.image_url || null))
    .filter(Boolean) as string[];

  await updateEncounterMapTokens(Math.trunc(id), JSON.stringify(validatedTokens));

  for (const filePath of removedTokenImagePaths) {
    try {
      await fsPromises.unlink(filePath);
    } catch {
      // ignore missing files
    }
  }

  return getScreenEncounterById(id);
}

export async function updateScreenEncounterTokenImage(idRaw: unknown, tokenIdRaw: unknown, imageUrl: string) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const tokenId = String(tokenIdRaw || '').trim();
  if (!tokenId) throw new HttpError(400, 'Некорректный id токена');
  if (!imageUrl || !String(imageUrl).trim()) throw new HttpError(400, 'Не удалось сохранить изображение токена');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  const tokens = normalizeMapTokens(encounter.map_tokens || []);
  let found = false;
  let oldImageUrl: string | null = null;
  const nextTokens = tokens.map((token) => {
    if (token.token_id !== tokenId) return token;
    found = true;
    oldImageUrl = token.image_url || null;
    return { ...token, image_url: String(imageUrl).trim() };
  });

  if (!found) throw new HttpError(404, 'Токен не найден');

  await updateEncounterMapTokens(Math.trunc(id), JSON.stringify(nextTokens));

  const oldPath = resolveUploadAbsolutePath(oldImageUrl);
  const newPath = resolveUploadAbsolutePath(String(imageUrl));
  if (oldPath && newPath && oldPath !== newPath) {
    try {
      await fsPromises.unlink(oldPath);
    } catch {
      // ignore missing files
    }
  }

  return getScreenEncounterById(id);
}

export async function removeScreenEncounterToken(idRaw: unknown, tokenIdRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const tokenId = String(tokenIdRaw || '').trim();
  if (!tokenId) throw new HttpError(400, 'Некорректный id токена');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  const tokens = normalizeMapTokens(encounter.map_tokens || []);
  const token = tokens.find((item) => item.token_id === tokenId);
  if (!token) throw new HttpError(404, 'Токен не найден');

  const nextTokens = tokens.filter((item) => item.token_id !== tokenId);
  await updateEncounterMapTokens(Math.trunc(id), JSON.stringify(nextTokens));

  const oldPath = resolveUploadAbsolutePath(token.image_url || null);
  if (oldPath) {
    try {
      await fsPromises.unlink(oldPath);
    } catch {
      // ignore missing files
    }
  }

  return getScreenEncounterById(id);
}

export async function rebroadcastScreenEncounterOrder(idRaw: unknown, input?: any) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  if (encounter.status !== 'active') throw new HttpError(400, 'Бой еще не активен');

  const initiativeOrder = makeInitiativeOrder(encounter.monsters);
  if (!initiativeOrder.length) throw new HttpError(400, 'Нет участников с инициативой для отправки');

  const mapViewDataUrl = normalizeMapViewDataUrl(input?.map_view_data_url);

  await updateEncounterInitiativeOrder(Math.trunc(id), JSON.stringify(initiativeOrder));

  await insertEncounterEvent(Math.trunc(id), {
    event: 'rebroadcast',
    encounter_id: Math.trunc(id),
    encounter_name: encounter.name,
    order: initiativeOrder,
    map_view_data_url: mapViewDataUrl,
    map_image_url: encounter.map_image_url,
    map_grid_size_ft: encounter.map_grid_size_ft,
    map_grid_opacity: encounter.map_grid_opacity,
    map_grid_dashed: encounter.map_grid_dashed,
    map_tokens: encounter.map_tokens,
    started_at: new Date().toISOString(),
  }, 'screen.encounter.rebroadcast');

  return getScreenEncounterById(id);
}

export async function updateScreenEncounterMonsterHp(idRaw: unknown, monsterInstanceIdRaw: unknown, hpCurrentRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const monsterInstanceId = String(monsterInstanceIdRaw || '').trim();
  if (!monsterInstanceId) throw new HttpError(400, 'Некорректный id существа');

  const hpCurrent = Number(hpCurrentRaw);
  if (!Number.isFinite(hpCurrent)) throw new HttpError(400, 'HP должен быть числом');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  let found = false;
  const monsters = encounter.monsters.map((monster) => {
    if (monster.monster_instance_id !== monsterInstanceId) return monster;
    found = true;
    return {
      ...monster,
      hp_current: Math.max(Math.trunc(hpCurrent), 0),
    };
  });

  if (!found) throw new HttpError(404, 'Существо в энкаунтере не найдено');

  await updateEncounterMonsters(Math.trunc(id), JSON.stringify(monsters));
  return getScreenEncounterById(id);
}

export async function updateScreenEncounterParticipantInitiative(
  idRaw: unknown,
  monsterInstanceIdRaw: unknown,
  initiativeTotalRaw: unknown
) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const monsterInstanceId = String(monsterInstanceIdRaw || '').trim();
  if (!monsterInstanceId) throw new HttpError(400, 'Некорректный id существа');

  const initiativeTotal = Number(initiativeTotalRaw);
  if (!Number.isFinite(initiativeTotal)) throw new HttpError(400, 'Инициатива должна быть числом');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  let found = false;
  const monsters = encounter.monsters.map((monster) => {
    if (monster.monster_instance_id !== monsterInstanceId) return monster;
    found = true;
    const nextInitiative = Math.trunc(initiativeTotal);
    if (monster.participant_type === 'player') {
      return {
        ...monster,
        initiative_custom: nextInitiative,
        initiative_total: nextInitiative,
        initiative_roll: null,
        dex_mod: 0,
      };
    }
    return {
      ...monster,
      initiative_custom: nextInitiative,
      initiative_total: nextInitiative,
      initiative_roll: null,
    };
  });

  if (!found) throw new HttpError(404, 'Существо в энкаунтере не найдено');

  const initiativeOrder = makeInitiativeOrder(monsters);
  await updateEncounter(
    Math.trunc(id),
    encounter.name,
    JSON.stringify(monsters),
    encounter.status === 'active' ? 'active' : 'draft',
    JSON.stringify(initiativeOrder)
  );

  return getScreenEncounterById(id);
}

export async function addScreenEncounterParticipantFromBestiary(idRaw: unknown, bestiaryIdRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const bestiaryId = Number(bestiaryIdRaw);
  if (!Number.isFinite(bestiaryId) || bestiaryId <= 0) throw new HttpError(400, 'Некорректный bestiary_id');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  const list = await listBestiaryByIds([Math.trunc(bestiaryId)]);
  const source = Array.isArray(list) ? list[0] : null;
  if (!source) throw new HttpError(404, 'Существо из бестиария не найдено');

  const participant = buildSnapshot(source);
  if (encounter.status === 'active') {
    const roll = Math.floor(Math.random() * 20) + 1;
    const dexMod = abilityMod(participant.dexterity);
    participant.dex_mod = dexMod;
    participant.initiative_roll = roll;
    participant.initiative_total = roll + dexMod;
    participant.initiative_custom = null;
  }

  const monsters = [...encounter.monsters, participant];
  const initiativeOrder = makeInitiativeOrder(monsters);

  await updateEncounter(
    Math.trunc(id),
    encounter.name,
    JSON.stringify(monsters),
    encounter.status === 'active' ? 'active' : 'draft',
    JSON.stringify(initiativeOrder)
  );

  return getScreenEncounterById(id);
}

export async function removeScreenEncounterParticipant(idRaw: unknown, monsterInstanceIdRaw: unknown) {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) throw new HttpError(400, 'Некорректный id энкаунтера');

  const monsterInstanceId = String(monsterInstanceIdRaw || '').trim();
  if (!monsterInstanceId) throw new HttpError(400, 'Некорректный id существа');

  const row = await findEncounterById(Math.trunc(id));
  if (!row) throw new HttpError(404, 'Энкаунтер не найден');

  const encounter = deserializeEncounter(row);
  const monsters = encounter.monsters.filter((monster) => monster.monster_instance_id !== monsterInstanceId);

  if (monsters.length === encounter.monsters.length) {
    throw new HttpError(404, 'Существо в энкаунтере не найдено');
  }

  const prevTokens = normalizeMapTokens(encounter.map_tokens || []);
  const removedTokenImagePaths = prevTokens
    .filter((token) => token.linked_monster_instance_id === monsterInstanceId)
    .map((token) => resolveUploadAbsolutePath(token.image_url || null))
    .filter(Boolean) as string[];

  const mapTokens = prevTokens.filter((token) => token.linked_monster_instance_id !== monsterInstanceId);

  const initiativeOrder = makeInitiativeOrder(monsters);

  await updateEncounter(
    Math.trunc(id),
    encounter.name,
    JSON.stringify(monsters),
    encounter.status === 'active' ? 'active' : 'draft',
    JSON.stringify(initiativeOrder)
  );

  await updateEncounterMapTokens(Math.trunc(id), JSON.stringify(mapTokens));

  for (const filePath of removedTokenImagePaths) {
    try {
      await fsPromises.unlink(filePath);
    } catch {
      // ignore missing files
    }
  }

  return getScreenEncounterById(id);
}
