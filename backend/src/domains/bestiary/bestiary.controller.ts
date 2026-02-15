import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { canViewHiddenBestiary } from '../../utils/permissions';
import {
  createBestiaryEntryRecord,
  deleteBestiaryEntryRecord,
  getBestiaryById,
  listBestiaryAdminData,
  listBestiaryPublic,
  updateBestiaryEntryRecord,
} from './bestiary.service';

export async function listBestiaryHandler(req: Request, res: Response) {
  try {
    const rows = await listBestiaryPublic(canViewHiddenBestiary(req.user));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listBestiaryAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listBestiaryAdminData();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getBestiaryEntryHandler(req: Request, res: Response) {
  try {
    const data = await getBestiaryById(Number(req.params.id), canViewHiddenBestiary(req.user));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createBestiaryEntryHandler(req: Request, res: Response) {
  try {
    const data = await createBestiaryEntryRecord(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении существа' });
  }
}

export async function updateBestiaryEntryHandler(req: Request, res: Response) {
  try {
    const data = await updateBestiaryEntryRecord(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении существа' });
  }
}

export async function deleteBestiaryEntryHandler(req: Request, res: Response) {
  try {
    const data = await deleteBestiaryEntryRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении существа' });
  }
}