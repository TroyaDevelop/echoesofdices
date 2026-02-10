import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createLore, createLoreLocation, deleteLoreById, deleteLoreLocation, getLoreBySlug, listLore, listLoreAdmin, listLoreLocations, updateLoreById } from './lore.service';

export async function listLoreHandler(_req: Request, res: Response) {
  try {
    const rows = await listLore();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listLoreAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listLoreAdmin();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listLocationsHandler(_req: Request, res: Response) {
  try {
    const rows = await listLoreLocations();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createLocationHandler(req: Request, res: Response) {
  try {
    const data = await createLoreLocation(req.body?.name);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Локация уже существует' });
      return;
    }
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании локации' });
  }
}

export async function deleteLocationHandler(req: Request, res: Response) {
  try {
    const data = await deleteLoreLocation(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении локации' });
  }
}

export async function getLoreHandler(req: Request, res: Response) {
  try {
    const data = await getLoreBySlug(req.params.slug);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createLoreHandler(req: Request, res: Response) {
  try {
    const data = await createLore(req.body || {}, Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании статьи' });
  }
}

export async function updateLoreHandler(req: Request, res: Response) {
  try {
    const data = await updateLoreById(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении статьи' });
  }
}

export async function deleteLoreHandler(req: Request, res: Response) {
  try {
    const data = await deleteLoreById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении статьи' });
  }
}
