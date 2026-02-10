import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createSourceRecord, deleteSourceRecord, listSourcesData } from '../spells/spells.service';

export async function listSourcesHandler(_req: Request, res: Response) {
  try {
    const rows = await listSourcesData();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createSourceHandler(req: Request, res: Response) {
  try {
    const data = await createSourceRecord(req.body?.name);
    res.status(201).json(data);
  } catch (error) {
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Источник уже существует' });
      return;
    }
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении источника' });
  }
}

export async function deleteSourceHandler(req: Request, res: Response) {
  try {
    const data = await deleteSourceRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении источника' });
  }
}
