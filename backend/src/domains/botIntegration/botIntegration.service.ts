import { MARKET_BOT_INTEGRATION_KEY } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import {
  acknowledgeEncounterEvents,
  acknowledgeMarketEvents,
  listPendingEncounterEvents,
  listPendingMarketEvents,
} from './botIntegration.repository';

function assertIntegrationKey(keyRaw: unknown) {
  const expected = String(MARKET_BOT_INTEGRATION_KEY || '').trim();
  if (!expected) throw new HttpError(503, 'Интеграция бота не настроена');
  const provided = String(keyRaw || '').trim();
  if (!provided || provided !== expected) throw new HttpError(401, 'Неверный ключ интеграции');
}

export async function getBotMarketEvents(input: { afterIdRaw: unknown; limitRaw: unknown; integrationKey: unknown }) {
  assertIntegrationKey(input.integrationKey);

  const afterValue = Number(input.afterIdRaw ?? 0);
  const afterId = Number.isFinite(afterValue) && afterValue >= 0 ? Math.trunc(afterValue) : 0;

  const limitValue = Number(input.limitRaw ?? 50);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 200) : 50;

  const rows = await listPendingMarketEvents(afterId, limit);
  const events = (rows || []).map((row) => {
    let payload: any = null;
    try {
      if (typeof row.payload_json === 'string') payload = JSON.parse(row.payload_json);
      else payload = row.payload_json;
    } catch {
      payload = null;
    }

    return {
      event_id: Number(row.event_id),
      trade_log_id: Number(row.trade_log_id),
      event_type: row.event_type,
      created_at: row.created_at,
      payload,
    };
  });

  const nextAfterId = events.length > 0 ? Number(events[events.length - 1].event_id) : afterId;
  return { events, next_after_id: nextAfterId };
}

export async function ackBotMarketEvents(input: { eventIds: unknown; consumerRaw: unknown; integrationKey: unknown }) {
  assertIntegrationKey(input.integrationKey);

  const eventIdsRaw = Array.isArray(input.eventIds) ? input.eventIds : [];
  const eventIds = eventIdsRaw
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.trunc(value));

  if (eventIds.length === 0) throw new HttpError(400, 'event_ids должен содержать хотя бы один id');

  const consumerValue = String(input.consumerRaw || 'bot-martha').trim();
  const consumer = consumerValue ? consumerValue.slice(0, 64) : 'bot-martha';

  await acknowledgeMarketEvents(eventIds, consumer);
  return { acknowledged: eventIds.length };
}

export async function getBotEncounterEvents(input: { afterIdRaw: unknown; limitRaw: unknown; integrationKey: unknown }) {
  assertIntegrationKey(input.integrationKey);

  const afterValue = Number(input.afterIdRaw ?? 0);
  const afterId = Number.isFinite(afterValue) && afterValue >= 0 ? Math.trunc(afterValue) : 0;

  const limitValue = Number(input.limitRaw ?? 50);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 200) : 50;

  const rows = await listPendingEncounterEvents(afterId, limit);
  const events = (rows || []).map((row) => {
    let payload: any = null;
    try {
      if (typeof row.payload_json === 'string') payload = JSON.parse(row.payload_json);
      else payload = row.payload_json;
    } catch {
      payload = null;
    }

    return {
      event_id: Number(row.event_id),
      encounter_id: Number(row.encounter_id),
      event_type: row.event_type,
      created_at: row.created_at,
      payload,
    };
  });

  const nextAfterId = events.length > 0 ? Number(events[events.length - 1].event_id) : afterId;
  return { events, next_after_id: nextAfterId };
}

export async function ackBotEncounterEvents(input: { eventIds: unknown; consumerRaw: unknown; integrationKey: unknown }) {
  assertIntegrationKey(input.integrationKey);

  const eventIdsRaw = Array.isArray(input.eventIds) ? input.eventIds : [];
  const eventIds = eventIdsRaw
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.trunc(value));

  if (eventIds.length === 0) throw new HttpError(400, 'event_ids должен содержать хотя бы один id');

  const consumerValue = String(input.consumerRaw || 'bot-martha').trim();
  const consumer = consumerValue ? consumerValue.slice(0, 64) : 'bot-martha';

  await acknowledgeEncounterEvents(eventIds, consumer);
  return { acknowledged: eventIds.length };
}
