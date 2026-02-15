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

export async function listPendingMarketEvents(afterId: number, limit: number) {
  return query<any[]>(
    'SELECT id AS event_id, trade_log_id, event_type, payload_json, created_at FROM market_trade_events WHERE consumed_at IS NULL AND id > ? ORDER BY id ASC LIMIT ?',
    [afterId, limit]
  );
}

export async function acknowledgeMarketEvents(eventIds: number[], consumer: string) {
  if (!Array.isArray(eventIds) || eventIds.length === 0) return;
  const placeholders = eventIds.map(() => '?').join(', ');
  await query(
    `UPDATE market_trade_events SET consumed_at = CURRENT_TIMESTAMP, consumed_by = ? WHERE consumed_at IS NULL AND id IN (${placeholders})`,
    [consumer, ...eventIds]
  );
}

export async function listPendingEncounterEvents(afterId: number, limit: number) {
  await ensureScreenEncounterEventsSchema();
  return query<any[]>(
    'SELECT id AS event_id, encounter_id, event_type, payload_json, created_at FROM screen_encounter_events WHERE consumed_at IS NULL AND id > ? ORDER BY id ASC LIMIT ?',
    [afterId, limit]
  );
}

export async function acknowledgeEncounterEvents(eventIds: number[], consumer: string) {
  if (!Array.isArray(eventIds) || eventIds.length === 0) return;
  await ensureScreenEncounterEventsSchema();
  const placeholders = eventIds.map(() => '?').join(', ');
  await query(
    `UPDATE screen_encounter_events SET consumed_at = CURRENT_TIMESTAMP, consumed_by = ? WHERE consumed_at IS NULL AND id IN (${placeholders})`,
    [consumer, ...eventIds]
  );
}
