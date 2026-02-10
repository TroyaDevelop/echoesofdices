import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createSpellClassRecord, deleteSpellClassRecord, listSpellClasses } from '../spells/spells.service';

export async function listSpellClassesHandler(_req: Request, res: Response) {
  try {
    const rows = await listSpellClasses();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createSpellClassHandler(req: Request, res: Response) {
  try {
    const data = await createSpellClassRecord(req.body?.name);
    res.status(201).json(data);
  } catch (error) {
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Класс уже существует' });
      return;
    }
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении класса' });
  }
}

export async function deleteSpellClassHandler(req: Request, res: Response) {
  try {
    const data = await deleteSpellClassRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении класса' });
  }
}
