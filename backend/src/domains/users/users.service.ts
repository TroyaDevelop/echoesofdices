import { HttpError } from '../../utils/httpError';
import { normalizeAbilityScore, normalizeLevel, normalizeSkillValue } from '../../utils/normalizers';
import {
  countCharacterSheets,
  createCharacterSheet,
  deleteCharacterSheet,
  findCharacterSheetForUser,
  findUserById,
  listCharacterSheets,
  listMyAwards,
  listUserAwards,
  updateCharacterSheet,
  updateUserById,
} from './users.repository';

export async function getProfile(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new HttpError(404, 'Пользователь не найден');
  delete user.password;
  return user;
}

export async function updateProfile(userId: number, body: any) {
  const existing = await findUserById(userId);
  if (!existing) throw new HttpError(404, 'Пользователь не найден');

  const hasLevel = Object.prototype.hasOwnProperty.call(body || {}, 'character_level');
  const nextLevel = normalizeLevel(body?.character_level);
  if (hasLevel && nextLevel === undefined) {
    throw new HttpError(400, 'Уровень должен быть числом от 1 до 20 или пустым значением');
  }

  const nextStrength = normalizeAbilityScore(body?.strength);
  if (nextStrength === undefined) throw new HttpError(400, 'Сила должна быть числом от 1 до 30 или пустым значением');
  const nextDexterity = normalizeAbilityScore(body?.dexterity);
  if (nextDexterity === undefined) throw new HttpError(400, 'Ловкость должна быть числом от 1 до 30 или пустым значением');
  const nextConstitution = normalizeAbilityScore(body?.constitution);
  if (nextConstitution === undefined) throw new HttpError(400, 'Телосложение должно быть числом от 1 до 30 или пустым значением');
  const nextIntelligence = normalizeAbilityScore(body?.intelligence);
  if (nextIntelligence === undefined) throw new HttpError(400, 'Интеллект должен быть числом от 1 до 30 или пустым значением');
  const nextWisdom = normalizeAbilityScore(body?.wisdom);
  if (nextWisdom === undefined) throw new HttpError(400, 'Мудрость должна быть числом от 1 до 30 или пустым значением');
  const nextCharisma = normalizeAbilityScore(body?.charisma);
  if (nextCharisma === undefined) throw new HttpError(400, 'Харизма должна быть числом от 1 до 30 или пустым значением');

  const nextAcrobatics = normalizeSkillValue(body?.skill_acrobatics);
  if (nextAcrobatics === undefined) throw new HttpError(400, 'Некорректное значение навыка Акробатика');
  const nextAnimalHandling = normalizeSkillValue(body?.skill_animal_handling);
  if (nextAnimalHandling === undefined) throw new HttpError(400, 'Некорректное значение навыка Уход за животными');
  const nextArcana = normalizeSkillValue(body?.skill_arcana);
  if (nextArcana === undefined) throw new HttpError(400, 'Некорректное значение навыка Магия');
  const nextAthletics = normalizeSkillValue(body?.skill_athletics);
  if (nextAthletics === undefined) throw new HttpError(400, 'Некорректное значение навыка Атлетика');
  const nextDeception = normalizeSkillValue(body?.skill_deception);
  if (nextDeception === undefined) throw new HttpError(400, 'Некорректное значение навыка Обман');
  const nextHistory = normalizeSkillValue(body?.skill_history);
  if (nextHistory === undefined) throw new HttpError(400, 'Некорректное значение навыка История');
  const nextInsight = normalizeSkillValue(body?.skill_insight);
  if (nextInsight === undefined) throw new HttpError(400, 'Некорректное значение навыка Проницательность');
  const nextIntimidation = normalizeSkillValue(body?.skill_intimidation);
  if (nextIntimidation === undefined) throw new HttpError(400, 'Некорректное значение навыка Запугивание');
  const nextInvestigation = normalizeSkillValue(body?.skill_investigation);
  if (nextInvestigation === undefined) throw new HttpError(400, 'Некорректное значение навыка Анализ');
  const nextMedicine = normalizeSkillValue(body?.skill_medicine);
  if (nextMedicine === undefined) throw new HttpError(400, 'Некорректное значение навыка Медицина');
  const nextNature = normalizeSkillValue(body?.skill_nature);
  if (nextNature === undefined) throw new HttpError(400, 'Некорректное значение навыка Природа');
  const nextPerception = normalizeSkillValue(body?.skill_perception);
  if (nextPerception === undefined) throw new HttpError(400, 'Некорректное значение навыка Восприятие');
  const nextPerformance = normalizeSkillValue(body?.skill_performance);
  if (nextPerformance === undefined) throw new HttpError(400, 'Некорректное значение навыка Выступление');
  const nextPersuasion = normalizeSkillValue(body?.skill_persuasion);
  if (nextPersuasion === undefined) throw new HttpError(400, 'Некорректное значение навыка Убеждение');
  const nextReligion = normalizeSkillValue(body?.skill_religion);
  if (nextReligion === undefined) throw new HttpError(400, 'Некорректное значение навыка Религия');
  const nextSleightOfHand = normalizeSkillValue(body?.skill_sleight_of_hand);
  if (nextSleightOfHand === undefined) throw new HttpError(400, 'Некорректное значение навыка Ловкость рук');
  const nextStealth = normalizeSkillValue(body?.skill_stealth);
  if (nextStealth === undefined) throw new HttpError(400, 'Некорректное значение навыка Скрытность');
  const nextSurvival = normalizeSkillValue(body?.skill_survival);
  if (nextSurvival === undefined) throw new HttpError(400, 'Некорректное значение навыка Выживание');

  const merged: Record<string, any> = {
    character_level: nextLevel === undefined ? existing.character_level : nextLevel,
    strength: nextStrength === undefined ? existing.strength : nextStrength,
    dexterity: nextDexterity === undefined ? existing.dexterity : nextDexterity,
    constitution: nextConstitution === undefined ? existing.constitution : nextConstitution,
    intelligence: nextIntelligence === undefined ? existing.intelligence : nextIntelligence,
    wisdom: nextWisdom === undefined ? existing.wisdom : nextWisdom,
    charisma: nextCharisma === undefined ? existing.charisma : nextCharisma,
    skill_acrobatics: nextAcrobatics === undefined ? existing.skill_acrobatics : nextAcrobatics,
    skill_animal_handling: nextAnimalHandling === undefined ? existing.skill_animal_handling : nextAnimalHandling,
    skill_arcana: nextArcana === undefined ? existing.skill_arcana : nextArcana,
    skill_athletics: nextAthletics === undefined ? existing.skill_athletics : nextAthletics,
    skill_deception: nextDeception === undefined ? existing.skill_deception : nextDeception,
    skill_history: nextHistory === undefined ? existing.skill_history : nextHistory,
    skill_insight: nextInsight === undefined ? existing.skill_insight : nextInsight,
    skill_intimidation: nextIntimidation === undefined ? existing.skill_intimidation : nextIntimidation,
    skill_investigation: nextInvestigation === undefined ? existing.skill_investigation : nextInvestigation,
    skill_medicine: nextMedicine === undefined ? existing.skill_medicine : nextMedicine,
    skill_nature: nextNature === undefined ? existing.skill_nature : nextNature,
    skill_perception: nextPerception === undefined ? existing.skill_perception : nextPerception,
    skill_performance: nextPerformance === undefined ? existing.skill_performance : nextPerformance,
    skill_persuasion: nextPersuasion === undefined ? existing.skill_persuasion : nextPersuasion,
    skill_religion: nextReligion === undefined ? existing.skill_religion : nextReligion,
    skill_sleight_of_hand: nextSleightOfHand === undefined ? existing.skill_sleight_of_hand : nextSleightOfHand,
    skill_stealth: nextStealth === undefined ? existing.skill_stealth : nextStealth,
    skill_survival: nextSurvival === undefined ? existing.skill_survival : nextSurvival,
  };

  const strFields: Record<string, number> = {
    character_name: 100,
    race: 100,
    class_name: 100,
    background: 100,
    alignment: 60,
    hit_dice_type: 5,
    hit_dice_json: 10000,
    character_image_url: 500,
    character_images_json: 10000,
    spellcasting_ability: 20,
    conditions: 500,
    personality: 2000,
    ideals: 2000,
    bonds: 2000,
    flaws: 2000,
    other_proficiencies: 2000,
    features_traits: 5000,
    notes: 5000,
    equipment: 5000,
    attacks_json: 10000,
  };

  for (const [f, mx] of Object.entries(strFields)) {
    if (body[f] !== undefined) {
      const v = body[f] === null ? null : String(body[f]).trim() || null;
      if (v && v.length > mx) throw new HttpError(400, `Поле ${f} слишком длинное (макс. ${mx})`);
      merged[f] = v;
    }
  }

  const intF = ['xp_current', 'xp_max', 'hp_max', 'hp_current', 'temp_hp', 'hit_dice_count', 'armor_class', 'speed', 'initiative_bonus', 'gold_cp', 'gold_sp', 'gold_gp', 'gold_pp'];
  for (const f of intF) {
    if (body[f] !== undefined) {
      if (body[f] === null || body[f] === '') {
        merged[f] = null;
      } else {
        const n = Number(body[f]);
        if (!Number.isFinite(n)) throw new HttpError(400, `Некорректное значение ${f}`);
        merged[f] = Math.trunc(n);
      }
    }
  }

  const saveF = ['save_strength', 'save_dexterity', 'save_constitution', 'save_intelligence', 'save_wisdom', 'save_charisma'];
  for (const f of saveF) {
    if (body[f] !== undefined) {
      const v = normalizeSkillValue(body[f]);
      if (v === undefined) throw new HttpError(400, `Некорректное значение ${f}`);
      merged[f] = v;
    }
  }

  if (body.inspiration !== undefined) merged.inspiration = body.inspiration ? 1 : 0;

  await updateUserById(userId, merged);

  const updated = await findUserById(userId);
  if (updated) delete updated.password;
  return updated || { ...existing, ...merged };
}

export async function getUserAwards(userId: number) {
  return listUserAwards(userId);
}

export async function getMyAwards(userId: number) {
  return listMyAwards(userId);
}

const characterStringFields: Record<string, number> = {
  character_name: 100,
  race: 100,
  class_name: 100,
  subclass_name: 100,
  background: 100,
  alignment: 60,
  hit_dice_type: 5,
  hit_dice_json: 10000,
  character_image_url: 500,
  character_images_json: 10000,
  spells_json: 10000,
  spellcasting_ability: 20,
  conditions: 500,
  personality: 2000,
  ideals: 2000,
  bonds: 2000,
  flaws: 2000,
  other_proficiencies: 2000,
  features_traits: 5000,
  notes: 5000,
  equipment: 5000,
  attacks_json: 10000,
};

const characterIntFields = [
  'xp_current',
  'xp_max',
  'hp_max',
  'hp_current',
  'temp_hp',
  'hit_dice_count',
  'armor_class',
  'speed',
  'initiative_bonus',
  'gold_cp',
  'gold_sp',
  'gold_gp',
  'gold_pp',
];

const characterSaveFields = [
  'save_strength',
  'save_dexterity',
  'save_constitution',
  'save_intelligence',
  'save_wisdom',
  'save_charisma',
];

const characterDeathSaveFields = ['death_save_success', 'death_save_failure'];

const legacyCharacterFields = [
  'character_name',
  'race',
  'class_name',
  'subclass_name',
  'background',
  'alignment',
  'character_image_url',
  'character_images_json',
  'hit_dice_type',
  'hit_dice_count',
  'hit_dice_json',
  'character_level',
  'xp_current',
  'xp_max',
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
  'skill_acrobatics',
  'skill_animal_handling',
  'skill_arcana',
  'skill_athletics',
  'skill_deception',
  'skill_history',
  'skill_insight',
  'skill_intimidation',
  'skill_investigation',
  'skill_medicine',
  'skill_nature',
  'skill_perception',
  'skill_performance',
  'skill_persuasion',
  'skill_religion',
  'skill_sleight_of_hand',
  'skill_stealth',
  'skill_survival',
  'hp_max',
  'hp_current',
  'temp_hp',
  'armor_class',
  'speed',
  'initiative_bonus',
  'inspiration',
  'gold_cp',
  'gold_sp',
  'gold_gp',
  'gold_pp',
  'save_strength',
  'save_dexterity',
  'save_constitution',
  'save_intelligence',
  'save_wisdom',
  'save_charisma',
  'attacks_json',
  'spells_json',
  'features_traits',
  'other_proficiencies',
  'personality',
  'ideals',
  'bonds',
  'flaws',
  'conditions',
  'notes',
  'equipment',
  'spellcasting_ability',
  'death_save_success',
  'death_save_failure',
];

function stripUndefined(fields: Record<string, any>) {
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
}

function hasLegacyCharacterData(user: any) {
  return legacyCharacterFields.some((key) => user?.[key] !== null && user?.[key] !== undefined && user?.[key] !== '');
}

function buildCharacterMerged(existing: any, body: any) {
  const hasLevel = Object.prototype.hasOwnProperty.call(body || {}, 'character_level');
  const nextLevel = normalizeLevel(body?.character_level);
  if (hasLevel && nextLevel === undefined) {
    throw new HttpError(400, 'Уровень должен быть числом от 1 до 20 или пустым значением');
  }

  const nextStrength = normalizeAbilityScore(body?.strength);
  if (nextStrength === undefined) throw new HttpError(400, 'Сила должна быть числом от 1 до 30 или пустым значением');
  const nextDexterity = normalizeAbilityScore(body?.dexterity);
  if (nextDexterity === undefined) throw new HttpError(400, 'Ловкость должна быть числом от 1 до 30 или пустым значением');
  const nextConstitution = normalizeAbilityScore(body?.constitution);
  if (nextConstitution === undefined) throw new HttpError(400, 'Телосложение должно быть числом от 1 до 30 или пустым значением');
  const nextIntelligence = normalizeAbilityScore(body?.intelligence);
  if (nextIntelligence === undefined) throw new HttpError(400, 'Интеллект должен быть числом от 1 до 30 или пустым значением');
  const nextWisdom = normalizeAbilityScore(body?.wisdom);
  if (nextWisdom === undefined) throw new HttpError(400, 'Мудрость должна быть числом от 1 до 30 или пустым значением');
  const nextCharisma = normalizeAbilityScore(body?.charisma);
  if (nextCharisma === undefined) throw new HttpError(400, 'Харизма должна быть числом от 1 до 30 или пустым значением');

  const nextAcrobatics = normalizeSkillValue(body?.skill_acrobatics);
  if (nextAcrobatics === undefined) throw new HttpError(400, 'Некорректное значение навыка Акробатика');
  const nextAnimalHandling = normalizeSkillValue(body?.skill_animal_handling);
  if (nextAnimalHandling === undefined) throw new HttpError(400, 'Некорректное значение навыка Уход за животными');
  const nextArcana = normalizeSkillValue(body?.skill_arcana);
  if (nextArcana === undefined) throw new HttpError(400, 'Некорректное значение навыка Магия');
  const nextAthletics = normalizeSkillValue(body?.skill_athletics);
  if (nextAthletics === undefined) throw new HttpError(400, 'Некорректное значение навыка Атлетика');
  const nextDeception = normalizeSkillValue(body?.skill_deception);
  if (nextDeception === undefined) throw new HttpError(400, 'Некорректное значение навыка Обман');
  const nextHistory = normalizeSkillValue(body?.skill_history);
  if (nextHistory === undefined) throw new HttpError(400, 'Некорректное значение навыка История');
  const nextInsight = normalizeSkillValue(body?.skill_insight);
  if (nextInsight === undefined) throw new HttpError(400, 'Некорректное значение навыка Проницательность');
  const nextIntimidation = normalizeSkillValue(body?.skill_intimidation);
  if (nextIntimidation === undefined) throw new HttpError(400, 'Некорректное значение навыка Запугивание');
  const nextInvestigation = normalizeSkillValue(body?.skill_investigation);
  if (nextInvestigation === undefined) throw new HttpError(400, 'Некорректное значение навыка Анализ');
  const nextMedicine = normalizeSkillValue(body?.skill_medicine);
  if (nextMedicine === undefined) throw new HttpError(400, 'Некорректное значение навыка Медицина');
  const nextNature = normalizeSkillValue(body?.skill_nature);
  if (nextNature === undefined) throw new HttpError(400, 'Некорректное значение навыка Природа');
  const nextPerception = normalizeSkillValue(body?.skill_perception);
  if (nextPerception === undefined) throw new HttpError(400, 'Некорректное значение навыка Восприятие');
  const nextPerformance = normalizeSkillValue(body?.skill_performance);
  if (nextPerformance === undefined) throw new HttpError(400, 'Некорректное значение навыка Выступление');
  const nextPersuasion = normalizeSkillValue(body?.skill_persuasion);
  if (nextPersuasion === undefined) throw new HttpError(400, 'Некорректное значение навыка Убеждение');
  const nextReligion = normalizeSkillValue(body?.skill_religion);
  if (nextReligion === undefined) throw new HttpError(400, 'Некорректное значение навыка Религия');
  const nextSleightOfHand = normalizeSkillValue(body?.skill_sleight_of_hand);
  if (nextSleightOfHand === undefined) throw new HttpError(400, 'Некорректное значение навыка Ловкость рук');
  const nextStealth = normalizeSkillValue(body?.skill_stealth);
  if (nextStealth === undefined) throw new HttpError(400, 'Некорректное значение навыка Скрытность');
  const nextSurvival = normalizeSkillValue(body?.skill_survival);
  if (nextSurvival === undefined) throw new HttpError(400, 'Некорректное значение навыка Выживание');

  const merged: Record<string, any> = {
    character_level: nextLevel === undefined ? existing.character_level : nextLevel,
    strength: nextStrength === undefined ? existing.strength : nextStrength,
    dexterity: nextDexterity === undefined ? existing.dexterity : nextDexterity,
    constitution: nextConstitution === undefined ? existing.constitution : nextConstitution,
    intelligence: nextIntelligence === undefined ? existing.intelligence : nextIntelligence,
    wisdom: nextWisdom === undefined ? existing.wisdom : nextWisdom,
    charisma: nextCharisma === undefined ? existing.charisma : nextCharisma,
    skill_acrobatics: nextAcrobatics === undefined ? existing.skill_acrobatics : nextAcrobatics,
    skill_animal_handling: nextAnimalHandling === undefined ? existing.skill_animal_handling : nextAnimalHandling,
    skill_arcana: nextArcana === undefined ? existing.skill_arcana : nextArcana,
    skill_athletics: nextAthletics === undefined ? existing.skill_athletics : nextAthletics,
    skill_deception: nextDeception === undefined ? existing.skill_deception : nextDeception,
    skill_history: nextHistory === undefined ? existing.skill_history : nextHistory,
    skill_insight: nextInsight === undefined ? existing.skill_insight : nextInsight,
    skill_intimidation: nextIntimidation === undefined ? existing.skill_intimidation : nextIntimidation,
    skill_investigation: nextInvestigation === undefined ? existing.skill_investigation : nextInvestigation,
    skill_medicine: nextMedicine === undefined ? existing.skill_medicine : nextMedicine,
    skill_nature: nextNature === undefined ? existing.skill_nature : nextNature,
    skill_perception: nextPerception === undefined ? existing.skill_perception : nextPerception,
    skill_performance: nextPerformance === undefined ? existing.skill_performance : nextPerformance,
    skill_persuasion: nextPersuasion === undefined ? existing.skill_persuasion : nextPersuasion,
    skill_religion: nextReligion === undefined ? existing.skill_religion : nextReligion,
    skill_sleight_of_hand: nextSleightOfHand === undefined ? existing.skill_sleight_of_hand : nextSleightOfHand,
    skill_stealth: nextStealth === undefined ? existing.skill_stealth : nextStealth,
    skill_survival: nextSurvival === undefined ? existing.skill_survival : nextSurvival,
  };

  for (const [f, mx] of Object.entries(characterStringFields)) {
    if (body[f] !== undefined) {
      const v = body[f] === null ? null : String(body[f]).trim() || null;
      if (v && v.length > mx) throw new HttpError(400, `Поле ${f} слишком длинное (макс. ${mx})`);
      merged[f] = v;
    }
  }

  for (const f of characterIntFields) {
    if (body[f] !== undefined) {
      if (body[f] === null || body[f] === '') {
        merged[f] = null;
      } else {
        const n = Number(body[f]);
        if (!Number.isFinite(n)) throw new HttpError(400, `Некорректное значение ${f}`);
        merged[f] = Math.trunc(n);
      }
    }
  }

  for (const f of characterSaveFields) {
    if (body[f] !== undefined) {
      const v = normalizeSkillValue(body[f]);
      if (v === undefined) throw new HttpError(400, `Некорректное значение ${f}`);
      merged[f] = v;
    }
  }

  for (const f of characterDeathSaveFields) {
    if (body[f] !== undefined) {
      const raw = Number(body[f]);
      if (!Number.isFinite(raw)) throw new HttpError(400, `Некорректное значение ${f}`);
      const v = Math.trunc(raw);
      if (v < 0 || v > 3) throw new HttpError(400, `Некорректное значение ${f}`);
      merged[f] = v;
    }
  }

  if (body.inspiration !== undefined) merged.inspiration = body.inspiration ? 1 : 0;

  return merged;
}

export async function listMyCharacters(userId: number) {
  const existing = await listCharacterSheets(userId);
  if (existing.length > 0) return existing;

  const user = await findUserById(userId);
  if (!user || !hasLegacyCharacterData(user)) return [];

  const legacyFields = stripUndefined(
    legacyCharacterFields.reduce((acc, key) => {
      acc[key] = user[key];
      return acc;
    }, {} as Record<string, any>)
  );
  await createCharacterSheet(userId, legacyFields);
  return listCharacterSheets(userId);
}

export async function createMyCharacter(userId: number, body: any) {
  const count = await countCharacterSheets(userId);
  if (count >= 3) throw new HttpError(400, 'Можно создать не более 3 листов персонажа');

  const hasPayload = body && Object.keys(body).length > 0;
  const merged = hasPayload ? buildCharacterMerged({}, body || {}) : {};
  const created = await createCharacterSheet(userId, stripUndefined(merged));
  return created;
}

export async function getMyCharacter(userId: number, id: number) {
  const character = await findCharacterSheetForUser(userId, id);
  if (!character) throw new HttpError(404, 'Лист персонажа не найден');
  return character;
}

export async function updateMyCharacter(userId: number, id: number, body: any) {
  const existing = await findCharacterSheetForUser(userId, id);
  if (!existing) throw new HttpError(404, 'Лист персонажа не найден');

  const merged = buildCharacterMerged(existing, body || {});
  await updateCharacterSheet(userId, id, stripUndefined(merged));
  return findCharacterSheetForUser(userId, id);
}

export async function deleteMyCharacter(userId: number, id: number) {
  const existing = await findCharacterSheetForUser(userId, id);
  if (!existing) throw new HttpError(404, 'Лист персонажа не найден');
  await deleteCharacterSheet(userId, id);
  return { ok: true };
}
