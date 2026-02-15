import { query } from '../../db/pool';

let screenEncounterEventsSchemaReady = false;

async function ensureScreenEncounterEventsSchema() {
  if (screenEncounterEventsSchemaReady) return;

  await query(
    "CREATE TABLE IF NOT EXISTS screen_encounter_events (id BIGINT PRIMARY KEY AUTO_INCREMENT, encounter_id INT NOT NULL, event_type VARCHAR(64) NOT NULL DEFAULT 'screen.encounter.started', payload_json LONGTEXT NOT NULL, consumed_at TIMESTAMP NULL, consumed_by VARCHAR(64) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_screen_encounter_events_consumed (consumed_at, id), INDEX idx_screen_encounter_events_encounter (encounter_id), FOREIGN KEY (encounter_id) REFERENCES screen_encounters(id) ON DELETE CASCADE)",
    []
  );

  screenEncounterEventsSchemaReady = true;
}

export async function listEncountersRows(limit: number) {
  return query<any[]>(
    "SELECT e.id, e.name, e.status, e.monsters_json, e.initiative_order_json, e.created_by, e.started_by, e.started_at, e.created_at, e.updated_at, COALESCE(NULLIF(TRIM(us.nickname), ''), us.login, COALESCE(NULLIF(TRIM(uc.nickname), ''), uc.login)) AS master_name FROM screen_encounters e LEFT JOIN users uc ON uc.id = e.created_by LEFT JOIN users us ON us.id = e.started_by ORDER BY e.updated_at DESC, e.id DESC LIMIT ?",
    [limit]
  );
}

export async function findEncounterById(id: number) {
  const rows = await query<any[]>(
    "SELECT e.id, e.name, e.status, e.monsters_json, e.initiative_order_json, e.created_by, e.started_by, e.started_at, e.created_at, e.updated_at, COALESCE(NULLIF(TRIM(us.nickname), ''), us.login, COALESCE(NULLIF(TRIM(uc.nickname), ''), uc.login)) AS master_name FROM screen_encounters e LEFT JOIN users uc ON uc.id = e.created_by LEFT JOIN users us ON us.id = e.started_by WHERE e.id = ? LIMIT 1",
    [id]
  );
  return rows?.[0];
}

export async function insertEncounter(name: string, monstersJson: string, createdBy: number) {
  return query<any>('INSERT INTO screen_encounters (name, status, monsters_json, initiative_order_json, created_by) VALUES (?, ?, ?, NULL, ?)', [
    name,
    'draft',
    monstersJson,
    createdBy,
  ]);
}

export async function updateEncounter(
  id: number,
  name: string,
  monstersJson: string,
  status: 'draft' | 'active' | 'finished',
  initiativeOrderJson: string | null
) {
  return query<any>(
    'UPDATE screen_encounters SET name = ?, monsters_json = ?, status = ?, initiative_order_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, monstersJson, status, initiativeOrderJson, id]
  );
}

export async function updateEncounterMonsters(id: number, monstersJson: string) {
  return query<any>('UPDATE screen_encounters SET monsters_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [monstersJson, id]);
}

export async function setEncounterStarted(id: number, monstersJson: string, initiativeOrderJson: string, startedBy: number) {
  return query<any>(
    'UPDATE screen_encounters SET status = ?, monsters_json = ?, initiative_order_json = ?, started_by = ?, started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['active', monstersJson, initiativeOrderJson, startedBy, id]
  );
}

export async function updateEncounterInitiativeOrder(id: number, initiativeOrderJson: string) {
  return query<any>('UPDATE screen_encounters SET initiative_order_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    initiativeOrderJson,
    id,
  ]);
}

export async function listBestiaryByIds(ids: number[]) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(', ');
  return query<any[]>(
    `SELECT
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
      description
     FROM bestiary_entries
     WHERE id IN (${placeholders})`,
    ids
  );
}

export async function insertEncounterEvent(encounterId: number, payload: any) {
  await ensureScreenEncounterEventsSchema();
  return query<any>('INSERT INTO screen_encounter_events (encounter_id, event_type, payload_json) VALUES (?, ?, ?)', [
    encounterId,
    'screen.encounter.started',
    JSON.stringify(payload || {}),
  ]);
}

export async function listPendingEncounterEvents(afterId: number, limit: number) {
  await ensureScreenEncounterEventsSchema();
  return query<any[]>(
    'SELECT id AS event_id, encounter_id, event_type, payload_json, created_at FROM screen_encounter_events WHERE consumed_at IS NULL AND id > ? ORDER BY id ASC LIMIT ?',
    [afterId, limit]
  );
}

export async function acknowledgeEncounterEvents(eventIds: number[], consumer: string) {
  if (!eventIds.length) return;
  await ensureScreenEncounterEventsSchema();
  const placeholders = eventIds.map(() => '?').join(', ');
  await query(
    `UPDATE screen_encounter_events SET consumed_at = CURRENT_TIMESTAMP, consumed_by = ? WHERE consumed_at IS NULL AND id IN (${placeholders})`,
    [consumer, ...eventIds]
  );
}

export async function deleteEncounterById(id: number) {
  return query<any>('DELETE FROM screen_encounters WHERE id = ?', [id]);
}
