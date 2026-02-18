/**
 * lssAdapter.js
 * Import / export helpers for Long Story Short (LSS) character sheet JSON format.
 *
 * LSS sheet structure (top level):
 *   { tags, disabledBlocks, edition, spells, data: "<JSON string>", jsonType, version }
 *
 * The real data lives inside `data` as a stringified JSON blob.
 */

// ─── helpers ─────────────────────────────────────────────────────────────────

const num = (v, fallback = null) => {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** Extract plain text from a ProseMirror/TipTap doc node */
const docToText = (doc) => {
  if (!doc || typeof doc !== 'object') return '';
  const walk = (node) => {
    if (!node) return '';
    if (node.type === 'text') return String(node.text || '');
    if (Array.isArray(node.content)) {
      const parts = node.content.map(walk);
      if (node.type === 'paragraph' || node.type === 'doc' || node.type === 'listItem') {
        return parts.join('');
      }
      return parts.join(' ');
    }
    return '';
  };
  const paragraphs = Array.isArray(doc.content)
    ? doc.content.map((child) => walk(child))
    : [];
  return paragraphs.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

/** Safely get a text field value from the `text.*` section */
const getRichText = (textSection, key) => {
  try {
    const entry = textSection?.[key];
    if (!entry) return '';
    const raw = entry.value;
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      const doc = raw.data;
      return docToText(doc);
    }
    return '';
  } catch {
    return '';
  }
};

const normalizeSpellKey = (value) => String(value || '')
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-zа-я0-9]+/gi, ' ')
  .trim();

const extractSpellNamesFromTextSection = (textSection) => {
  if (!textSection || typeof textSection !== 'object') return [];
  const entries = Object.entries(textSection)
    .filter(([key]) => String(key).startsWith('spells-level-'))
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const names = [];
  const seen = new Set();
  for (const [, value] of entries) {
    const raw = getRichText({ tmp: value }, 'tmp');
    if (!raw) continue;
    const lines = String(raw)
      .split('\n')
      .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
      .filter(Boolean);

    for (const line of lines) {
      const key = normalizeSpellKey(line);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      names.push(line);
    }
  }
  return names;
};

/** Convert our internal text to a minimal ProseMirror doc */
const textToDoc = (text) => {
  const str = String(text || '');
  const paragraphs = str.split('\n').map((line) => {
    if (!line.trim()) {
      return { type: 'paragraph' };
    }
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    };
  });
  return { type: 'doc', content: paragraphs };
};

// Map LSS stat keys → our internal keys
const LSS_STAT_MAP = {
  str: 'strength',
  dex: 'dexterity',
  con: 'constitution',
  int: 'intelligence',
  wis: 'wisdom',
  cha: 'charisma',
};

// Map LSS skill names → our skill keys
const LSS_SKILL_MAP = {
  acrobatics: 'skill_acrobatics',
  investigation: 'skill_investigation',
  athletics: 'skill_athletics',
  perception: 'skill_perception',
  survival: 'skill_survival',
  performance: 'skill_performance',
  intimidation: 'skill_intimidation',
  history: 'skill_history',
  'sleight of hand': 'skill_sleight_of_hand',
  arcana: 'skill_arcana',
  medicine: 'skill_medicine',
  deception: 'skill_deception',
  nature: 'skill_nature',
  insight: 'skill_insight',
  religion: 'skill_religion',
  stealth: 'skill_stealth',
  persuasion: 'skill_persuasion',
  'animal handling': 'skill_animal_handling',
};

// Reverse maps for export
const OUR_STAT_TO_LSS = Object.fromEntries(
  Object.entries(LSS_STAT_MAP).map(([lss, ours]) => [ours, lss]),
);
const OUR_SKILL_TO_LSS = Object.fromEntries(
  Object.entries(LSS_SKILL_MAP).map(([lss, ours]) => [ours, lss]),
);

// ─── IMPORT ──────────────────────────────────────────────────────────────────

/**
 * Convert a Long Story Short JSON object into our flat character payload shape.
 * Returns the subset of fields that could be mapped; undefined fields are omitted.
 *
 * @param {object} lssJson  Top-level LSS JSON object
 * @returns {object}  Flat payload compatible with buildPayload / updateCharacter
 */
export function importFromLSS(lssJson) {
  if (!lssJson || typeof lssJson !== 'object') {
    throw new Error('Некорректный формат файла Long Story Short');
  }

  // Parse inner data string
  let d;
  try {
    d = typeof lssJson.data === 'string' ? JSON.parse(lssJson.data) : lssJson.data;
  } catch {
    throw new Error('Не удалось разобрать поле data в файле LSS');
  }
  if (!d || typeof d !== 'object') {
    throw new Error('Поле data отсутствует или имеет неверный формат');
  }

  const result = {};

  // ── Basic info ──
  result.character_name = String(d.name?.value || '');
  result.race = String(d.info?.race?.value || '');
  result.class_name = String(d.info?.charClass?.value || '');
  result.subclass_name = String(d.info?.charSubclass?.value || '');
  result.background = String(d.info?.background?.value || '');
  result.alignment = String(d.info?.alignment?.value || '');
  result.character_level = num(d.info?.level?.value, 1);
  result.xp_current = num(d.info?.experience?.value, null);

  // ── Ability scores ──
  const stats = d.stats || {};
  for (const [lssKey, ourKey] of Object.entries(LSS_STAT_MAP)) {
    const score = num(stats[lssKey]?.score, null);
    if (score !== null) result[ourKey] = score;
  }

  // ── Saving throws ──
  // LSS: saves.str.isProf (bool) → we store 0/1
  const lssSaves = d.saves || {};
  for (const [lssKey, ourStatKey] of Object.entries(LSS_STAT_MAP)) {
    const saveKey = `save_${ourStatKey}`;
    const isProf = lssSaves[lssKey]?.isProf;
    result[saveKey] = isProf ? 1 : 0;
  }

  // ── Skills ──
  // LSS: skills[name].isProf (0/1/2/bool)
  const lssSkills = d.skills || {};
  for (const [lssName, ourKey] of Object.entries(LSS_SKILL_MAP)) {
    const entry = lssSkills[lssName];
    if (!entry) {
      result[ourKey] = 0;
      continue;
    }
    const raw = entry.isProf;
    if (raw === true) result[ourKey] = 1;
    else if (raw === false || raw === undefined || raw === null) result[ourKey] = 0;
    else result[ourKey] = num(raw, 0);
  }

  // ── Vitality ──
  const vit = d.vitality || {};
  result.armor_class = num(vit.ac?.value, null);
  result.hp_max = num(vit['hp-max']?.value, null);
  result.hp_current = num(vit['hp-current']?.value, null);
  result.temp_hp = num(vit['hp-temp']?.value, null);
  result.speed = num(vit.speed?.value, null);
  result.death_save_success = num(vit.deathSuccesses, 0);
  result.death_save_failure = num(vit.deathFails, 0);

  // Hit dice: LSS stores a single value like "1d6"
  const hitDieRaw = String(vit['hit-die']?.value || '').trim();
  const hitDiceCountRaw = vit['hp-dice-current']?.value;
  if (hitDieRaw) {
    // Try to split e.g. "1d6" into count + type
    const m = hitDieRaw.match(/^(\d+)?(d\d+)$/i);
    if (m) {
      const countFromDie = m[1] ? Number(m[1]) : null;
      const dieType = m[2].toLowerCase(); // e.g. "d6"
      const finalCount = num(hitDiceCountRaw, countFromDie);
      result.hit_dice_json = JSON.stringify([{ type: dieType, count: finalCount }]);
    } else {
      // Store as-is in type field
      result.hit_dice_json = JSON.stringify([{
        type: hitDieRaw,
        count: num(hitDiceCountRaw, null),
      }]);
    }
  }

  // ── Coins ──
  const coins = d.coins || {};
  result.gold_cp = num(coins.cp?.value, null);
  result.gold_sp = num(coins.sp?.value, null);
  result.gold_gp = num(coins.gp?.value, null);
  result.gold_pp = num(coins.pp?.value, null);

  // ── Spellcasting ──
  result.spellcasting_ability = String(d.spellsInfo?.base?.code || '');

  // ── Text sections ──
  const text = d.text || {};
  const traitsText = getRichText(text, 'traits');
  const featuresText = getRichText(text, 'features');
  // Combine traits + features into features_traits, equipment, proficiencies, notes separately
  const featuresParts = [traitsText, featuresText].filter(Boolean);
  result.features_traits = featuresParts.join('\n\n');
  result.equipment = getRichText(text, 'equipment');
  result.other_proficiencies = getRichText(text, 'prof');
  result.notes = getRichText(text, 'notes') || getRichText(text, 'backstory') || '';
  result.personality = getRichText(text, 'personality') || getRichText(text, 'personalityTraits') || '';
  result.ideals = getRichText(text, 'ideals') || '';
  result.bonds = getRichText(text, 'bonds') || '';
  result.flaws = getRichText(text, 'flaws') || '';

  // ── Attacks / weapons ──
  const weaponsList = Array.isArray(d.weaponsList) ? d.weaponsList : [];
  if (weaponsList.length) {
    const attacks = weaponsList.map((w) => ({
      name: String(w.name?.value || w.name || ''),
      bonus: String(w.mod?.value || w.mod || ''),
      damage: String(w.dmg?.value || w.dmg || ''),
    }));
    result.attacks_json = JSON.stringify(attacks);
  }

  // ── Spells ──
  // LSS stores external IDs in top-level spells.prepared/book and spell names inside text.spells-level-*.
  const lssTopSpells = lssJson.spells || {};
  const preparedIds = Array.isArray(lssTopSpells.prepared)
    ? lssTopSpells.prepared
    : [];
  const bookIds = Array.isArray(lssTopSpells.book)
    ? lssTopSpells.book
    : [];

  const spellNamesFromText = extractSpellNamesFromTextSection(d.text || {});

  // Merge prepared + book, deduplicate, convert to our format
  const allSpellIds = [...new Set([...preparedIds, ...bookIds])];
  if (allSpellIds.length > 0 || spellNamesFromText.length > 0) {
    let syntheticId = -1;
    const spellEntries = [];

    for (const name of spellNamesFromText) {
      spellEntries.push({
        id: syntheticId,
        name,
        external: true,
        level: null,
      });
      syntheticId -= 1;
    }

    for (const rawId of allSpellIds) {
      spellEntries.push({
        id: syntheticId,
        name: String(rawId || '').trim(),
        external: true,
        level: null,
      });
      syntheticId -= 1;
    }

    result.spells_json = JSON.stringify(spellEntries);
  }

  return result;
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

/**
 * Convert our flat character payload into a Long Story Short JSON object.
 *
 * @param {object} payload  Result of buildPayload()
 * @returns {object}  Top-level LSS JSON object ready to stringify
 */
export function exportToLSS(payload) {
  const p = payload || {};

  // Parse spells list
  let spellsList = [];
  try {
    spellsList = JSON.parse(p.spells_json || '[]');
    if (!Array.isArray(spellsList)) spellsList = [];
  } catch { /* ignore */ }

  // Parse attacks
  let weaponsList = [];
  try {
    const attacks = JSON.parse(p.attacks_json || '[]');
    if (Array.isArray(attacks)) {
      weaponsList = attacks.map((a, i) => ({
        id: `weapon-export-${i}`,
        name: { value: String(a.name || '') },
        mod: { value: String(a.bonus || '') },
        dmg: { value: String(a.damage || '') },
        isProf: false,
        ability: 'str',
      }));
    }
  } catch { /* ignore */ }

  // Parse hit dice
  let hitDieValue = '';
  try {
    const hitDiceJson = JSON.parse(p.hit_dice_json || '[]');
    if (Array.isArray(hitDiceJson) && hitDiceJson[0]) {
      const first = hitDiceJson[0];
      const count = first.count != null ? String(first.count) : '';
      const type = String(first.type || '');
      // Convert back to "1d6" or just "d6" style
      if (count && type) {
        hitDieValue = `${count}${type}`;
      } else if (type) {
        hitDieValue = type;
      }
    }
  } catch { /* ignore */ }

  // Build saves
  const saves = {};
  for (const [lssKey, ourKey] of Object.entries(LSS_STAT_MAP)) {
    const saveKey = `save_${ourKey}`;
    saves[lssKey] = { name: lssKey, isProf: Boolean(p[saveKey]) };
  }

  // Build skills
  const skills = {};
  for (const [lssName, ourKey] of Object.entries(LSS_SKILL_MAP)) {
    const profValue = num(p[ourKey], 0);
    skills[lssName] = {
      baseStat: (() => {
        // Build a lazy reverse lookup of our skill→stat
        const skillDef = SKILL_ABILITY_MAP[ourKey];
        return skillDef ? OUR_STAT_TO_LSS[skillDef] || 'str' : 'str';
      })(),
      name: lssName,
      label: lssName,
      isProf: profValue > 0 ? profValue : false,
    };
  }

  // Stats
  const stats = {};
  for (const [lssKey, ourKey] of Object.entries(LSS_STAT_MAP)) {
    const score = num(p[ourKey], 10);
    stats[lssKey] = {
      name: lssKey,
      score,
      modifier: Math.floor((score - 10) / 2),
      label: { str: 'Сила', dex: 'Ловкость', con: 'Телосложение', int: 'Интеллект', wis: 'Мудрость', cha: 'Харизма' }[lssKey] || lssKey,
    };
  }

  // Text sections
  const buildTextEntry = (text, size = 10) => ({
    value: { data: textToDoc(text) },
    size,
  });

  const combinedFeatures = [p.features_traits || ''].filter(Boolean).join('\n\n');

  const textSection = {
    traits: buildTextEntry(combinedFeatures, 18),
    equipment: buildTextEntry(p.equipment || '', 9),
    prof: buildTextEntry(p.other_proficiencies || '', 14),
    attacks: buildTextEntry('', 26),
    features: buildTextEntry('', 10),
    notes: buildTextEntry(p.notes || '', 10),
    personality: buildTextEntry(p.personality || '', 10),
    ideals: buildTextEntry(p.ideals || '', 10),
    bonds: buildTextEntry(p.bonds || '', 10),
    flaws: buildTextEntry(p.flaws || '', 10),
  };

  // Add spell level text sections
  for (let lvl = 0; lvl <= 9; lvl++) {
    textSection[`spells-level-${lvl}`] = buildTextEntry('', 10);
  }

  // spells section (top-level)
  const spellIds = spellsList
    .map((s) => String(s.id))
    .filter(Boolean);

  const dataObj = {
    isDefault: true,
    jsonType: 'character',
    template: 'default',
    name: { value: p.character_name || '' },
    info: {
      charClass: { name: 'charClass', value: p.class_name || '', label: 'класс и уровень' },
      charSubclass: { name: 'charSubclass', value: p.subclass_name || '', label: 'подкласс' },
      level: { name: 'level', value: num(p.character_level, 1), label: 'уровень' },
      background: { name: 'background', value: p.background || '', label: 'предыстория' },
      playerName: { name: 'playerName', value: '', label: 'имя игрока' },
      race: { name: 'race', value: p.race || '', label: 'раса' },
      alignment: { name: 'alignment', value: p.alignment || '', label: 'мировоззрение' },
      experience: { name: 'experience', value: num(p.xp_current, 0), label: 'опыт' },
    },
    subInfo: {
      age: { name: 'age', value: '', label: 'возраст' },
      height: { name: 'height', value: '', label: 'рост' },
      weight: { name: 'weight', value: '', label: 'вес' },
      eyes: { name: 'eyes', value: '', label: 'глаза' },
      skin: { name: 'skin', value: '', label: 'кожа' },
      hair: { name: 'hair', value: '', label: 'волосы' },
    },
    spellsInfo: {
      base: { name: 'base', value: '', label: 'Базовая характеристика заклинаний', code: p.spellcasting_ability || '' },
      save: { name: 'save', value: '', label: 'Сложность спасброска' },
      mod: { name: 'mod', value: '', label: 'Бонус атаки заклинанием' },
      available: { classes: [] },
    },
    spells: {
      'slots-1': { value: 0 },
      'slots-2': { value: 0 },
      'slots-3': { value: 0 },
      'slots-4': { value: 0 },
      'slots-5': { value: 0 },
      'slots-6': { value: 0 },
      'slots-7': { value: 0 },
      'slots-8': { value: 0 },
      'slots-9': { value: 0 },
    },
    spellsPact: {},
    proficiency: (() => {
      const lvl = num(p.character_level, 1);
      if (lvl >= 17) return 6;
      if (lvl >= 13) return 5;
      if (lvl >= 9) return 4;
      if (lvl >= 5) return 3;
      return 2;
    })(),
    stats,
    saves,
    skills,
    vitality: {
      'hp-dice-current': { value: null },
      'hp-dice-multi': {},
      speed: { value: String(num(p.speed, '') ?? '') },
      ac: { value: num(p.armor_class, '') },
      'hp-max': { value: num(p.hp_max, '') },
      'hp-current': { value: num(p.hp_current, '') },
      isDying: false,
      deathFails: num(p.death_save_failure, 0),
      deathSuccesses: num(p.death_save_success, 0),
      'hit-die': { value: hitDieValue },
      'hp-temp': { value: num(p.temp_hp, 0) },
    },
    attunementsList: [],
    weaponsList,
    weapons: {},
    text: textSection,
    coins: {
      cp: { value: num(p.gold_cp, 0) },
      sp: { value: num(p.gold_sp, 0) },
      gp: { value: num(p.gold_gp, 0) },
      pp: { value: num(p.gold_pp, 0) },
      ep: { value: 0 },
      total: { value: 0 },
    },
    resources: {},
    bonusesSkills: {},
    bonusesStats: {},
    conditions: [],
    createdAt: new Date().toISOString(),
    casterClass: { value: p.class_name || '' },
    avatar: p.character_image_url ? { jpeg: p.character_image_url } : {},
  };

  return {
    tags: [],
    disabledBlocks: { 'info-left': [], 'info-right': [], 'notes-left': [], 'notes-right': [] },
    edition: '2014',
    spells: {
      mode: 'text',
      prepared: spellIds,
      book: [],
    },
    data: JSON.stringify(dataObj),
    jsonType: 'character',
    version: '2',
  };
}

// ─── skill → ability map (for export) ────────────────────────────────────────
// Maps our skill keys → ability key (needed to fill baseStat in LSS skills)
const SKILL_ABILITY_MAP = {
  skill_acrobatics: 'dexterity',
  skill_investigation: 'intelligence',
  skill_athletics: 'strength',
  skill_perception: 'wisdom',
  skill_survival: 'wisdom',
  skill_performance: 'charisma',
  skill_intimidation: 'charisma',
  skill_history: 'intelligence',
  skill_sleight_of_hand: 'dexterity',
  skill_arcana: 'intelligence',
  skill_medicine: 'wisdom',
  skill_deception: 'charisma',
  skill_nature: 'intelligence',
  skill_insight: 'wisdom',
  skill_religion: 'intelligence',
  skill_stealth: 'dexterity',
  skill_persuasion: 'charisma',
  skill_animal_handling: 'wisdom',
};
