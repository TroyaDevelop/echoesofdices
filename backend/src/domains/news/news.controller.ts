import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createNews, deleteNewsById, listNews, listNewsAdmin, updateNewsById } from './news.service';

export async function listNewsHandler(_req: Request, res: Response) {
  try {
    const rows = await listNews();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listNewsAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listNewsAdmin();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createNewsHandler(req: Request, res: Response) {
  try {
    const data = await createNews(req.body || {}, Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании новости' });
  }
}

export async function updateNewsHandler(req: Request, res: Response) {
  try {
    const data = await updateNewsById(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении новости' });
  }
}

export async function deleteNewsHandler(req: Request, res: Response) {
  try {
    const data = await deleteNewsById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении новости' });
  }
}
