import { query } from '../../db/pool';

const ENTRY_SELECT = `
  SELECT
    id,
    name,
    name_en,
    size,
    creature_type,
    alignment,
    armor_class,
    hit_points,
    speed,
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    saving_throws,
    skills,
    damage_vulnerabilities,
    damage_resistances,
    damage_immunities,
    condition_immunities,
    senses,
    languages,
    challenge_rating,
    proficiency_bonus,
    source,
    source_pages,
    traits_text,
    actions_text,
    reactions_text,
    legendary_actions_text,
    spellcasting_text,
    villain_actions_text,
    description,
    created_at,
    updated_at
  FROM bestiary_entries
`;

export async function listBestiaryEntries() {
  return query<any[]>(`${ENTRY_SELECT} ORDER BY name ASC`, []);
}

export async function listBestiaryEntriesAdmin() {
  return query<any[]>(`${ENTRY_SELECT} ORDER BY name ASC`, []);
}

export async function findBestiaryEntryById(id: number) {
  const rows = await query<any[]>(`${ENTRY_SELECT} WHERE id = ? LIMIT 1`, [id]);
  return rows?.[0];
}

export async function insertBestiaryEntry(payload: any) {
  return query<any>(
    `INSERT INTO bestiary_entries (
      name,
      name_en,
      size,
      creature_type,
      alignment,
      armor_class,
      hit_points,
      speed,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      saving_throws,
      skills,
      damage_vulnerabilities,
      damage_resistances,
      damage_immunities,
      condition_immunities,
      senses,
      languages,
      challenge_rating,
      proficiency_bonus,
      source,
      source_pages,
      traits_text,
      actions_text,
      reactions_text,
      legendary_actions_text,
      spellcasting_text,
      villain_actions_text,
      description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.name_en,
      payload.size,
      payload.creature_type,
      payload.alignment,
      payload.armor_class,
      payload.hit_points,
      payload.speed,
      payload.strength,
      payload.dexterity,
      payload.constitution,
      payload.intelligence,
      payload.wisdom,
      payload.charisma,
      payload.saving_throws,
      payload.skills,
      payload.damage_vulnerabilities,
      payload.damage_resistances,
      payload.damage_immunities,
      payload.condition_immunities,
      payload.senses,
      payload.languages,
      payload.challenge_rating,
      payload.proficiency_bonus,
      payload.source,
      payload.source_pages,
      payload.traits_text,
      payload.actions_text,
      payload.reactions_text,
      payload.legendary_actions_text,
      payload.spellcasting_text,
      payload.villain_actions_text,
      payload.description,
    ]
  );
}

export async function updateBestiaryEntry(id: number, payload: any) {
  return query<any>(
    `UPDATE bestiary_entries SET
      name = ?,
      name_en = ?,
      size = ?,
      creature_type = ?,
      alignment = ?,
      armor_class = ?,
      hit_points = ?,
      speed = ?,
      strength = ?,
      dexterity = ?,
      constitution = ?,
      intelligence = ?,
      wisdom = ?,
      charisma = ?,
      saving_throws = ?,
      skills = ?,
      damage_vulnerabilities = ?,
      damage_resistances = ?,
      damage_immunities = ?,
      condition_immunities = ?,
      senses = ?,
      languages = ?,
      challenge_rating = ?,
      proficiency_bonus = ?,
      source = ?,
      source_pages = ?,
      traits_text = ?,
      actions_text = ?,
      reactions_text = ?,
      legendary_actions_text = ?,
      spellcasting_text = ?,
      villain_actions_text = ?,
      description = ?
    WHERE id = ?`,
    [
      payload.name,
      payload.name_en,
      payload.size,
      payload.creature_type,
      payload.alignment,
      payload.armor_class,
      payload.hit_points,
      payload.speed,
      payload.strength,
      payload.dexterity,
      payload.constitution,
      payload.intelligence,
      payload.wisdom,
      payload.charisma,
      payload.saving_throws,
      payload.skills,
      payload.damage_vulnerabilities,
      payload.damage_resistances,
      payload.damage_immunities,
      payload.condition_immunities,
      payload.senses,
      payload.languages,
      payload.challenge_rating,
      payload.proficiency_bonus,
      payload.source,
      payload.source_pages,
      payload.traits_text,
      payload.actions_text,
      payload.reactions_text,
      payload.legendary_actions_text,
      payload.spellcasting_text,
      payload.villain_actions_text,
      payload.description,
      id,
    ]
  );
}

export async function deleteBestiaryEntry(id: number) {
  return query<any>('DELETE FROM bestiary_entries WHERE id = ?', [id]);
}