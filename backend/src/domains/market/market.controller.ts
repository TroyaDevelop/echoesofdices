import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createMarketItem, createMarketRegion, createMarketTradeLog, deleteMarketItem, deleteMarketRegion, listMarketItems, listMarketMarkups, listMarketRegions, listMarketTrades, updateMarketItem, updateMarketRegion, upsertMarketMarkup } from './market.service';

export async function listMarketItemsHandler(_req: Request, res: Response) {
  try {
    const rows = await listMarketItems();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listMarketRegionsHandler(_req: Request, res: Response) {
  try {
    const rows = await listMarketRegions();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createMarketRegionHandler(req: Request, res: Response) {
  try {
    const data = await createMarketRegion(req.body?.name);
    res.status(201).json(data);
  } catch (error) {
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Регион с таким названием уже существует' });
      return;
    }
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении региона' });
  }
}

export async function updateMarketRegionHandler(req: Request, res: Response) {
  try {
    const data = await updateMarketRegion(Number(req.params.id), req.body?.name);
    res.json(data);
  } catch (error) {
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Регион с таким названием уже существует' });
      return;
    }
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении региона' });
  }
}

export async function deleteMarketRegionHandler(req: Request, res: Response) {
  try {
    const data = await deleteMarketRegion(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении региона' });
  }
}

export async function listMarketMarkupsHandler(req: Request, res: Response) {
  try {
    const rows = await listMarketMarkups(req.query?.season);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function upsertMarketMarkupHandler(req: Request, res: Response) {
  try {
    const data = await upsertMarketMarkup(req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при сохранении наценки' });
  }
}

export async function listMarketTradesHandler(req: Request, res: Response) {
  try {
    const rows = await listMarketTrades(req.query?.limit);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createMarketTradeHandler(req: Request, res: Response) {
  try {
    const data = await createMarketTradeLog(req.body || {}, Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при записи сделки' });
  }
}

export async function createMarketItemHandler(req: Request, res: Response) {
  try {
    const data = await createMarketItem(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении предмета' });
  }
}

export async function updateMarketItemHandler(req: Request, res: Response) {
  try {
    const data = await updateMarketItem(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении предмета' });
  }
}

export async function deleteMarketItemHandler(req: Request, res: Response) {
  try {
    const data = await deleteMarketItem(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении предмета' });
  }
}
