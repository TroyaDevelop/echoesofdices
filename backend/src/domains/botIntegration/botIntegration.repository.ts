import { query } from '../../db/pool';

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
  return query<any[]>(
    'SELECT id AS event_id, encounter_id, event_type, payload_json, created_at FROM screen_encounter_events WHERE consumed_at IS NULL AND id > ? ORDER BY id ASC LIMIT ?',
    [afterId, limit]
  );
}

export async function acknowledgeEncounterEvents(eventIds: number[], consumer: string) {
  if (!Array.isArray(eventIds) || eventIds.length === 0) return;
  const placeholders = eventIds.map(() => '?').join(', ');
  await query(
    `UPDATE screen_encounter_events SET consumed_at = CURRENT_TIMESTAMP, consumed_by = ? WHERE consumed_at IS NULL AND id IN (${placeholders})`,
    [consumer, ...eventIds]
  );
}
