import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { ackBotMarketEvents, getBotMarketEvents } from './botIntegration.service';

export async function getBotMarketEventsHandler(req: Request, res: Response) {
  try {
    const data = await getBotMarketEvents({
      afterIdRaw: req.query?.after_id,
      limitRaw: req.query?.limit,
      integrationKey: req.header('x-integration-key'),
    });
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка интеграции бота' });
  }
}

export async function ackBotMarketEventsHandler(req: Request, res: Response) {
  try {
    const data = await ackBotMarketEvents({
      eventIds: req.body?.event_ids,
      consumerRaw: req.body?.consumer,
      integrationKey: req.header('x-integration-key'),
    });
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка интеграции бота' });
  }
}
