import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createSpellSchoolRecord, deleteSpellSchoolRecord, listSpellSchools } from '../spells/spells.service';

export async function listSpellSchoolsHandler(_req: Request, res: Response) {
  try {
    const rows = await listSpellSchools();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createSpellSchoolHandler(req: Request, res: Response) {
  try {
    const data = await createSpellSchoolRecord(req.body?.name);
    res.status(201).json(data);
  } catch (error) {
    if (String((error as any)?.code || '').toUpperCase() === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Школа уже существует' });
      return;
    }
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении школы' });
  }
}

export async function deleteSpellSchoolHandler(req: Request, res: Response) {
  try {
    const data = await deleteSpellSchoolRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении школы' });
  }
}
