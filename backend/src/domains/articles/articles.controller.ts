import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { createArticle, deleteArticleById, getArticleBySlug, listArticles, listArticlesAdmin, updateArticleById } from './articles.service';

export async function listArticlesHandler(_req: Request, res: Response) {
  try {
    const rows = await listArticles();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listArticlesAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listArticlesAdmin();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getArticleHandler(req: Request, res: Response) {
  try {
    const data = await getArticleBySlug(req.params.slug);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createArticleHandler(req: Request, res: Response) {
  try {
    const data = await createArticle(req.body || {}, Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании статьи' });
  }
}

export async function updateArticleHandler(req: Request, res: Response) {
  try {
    const data = await updateArticleById(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении статьи' });
  }
}

export async function deleteArticleHandler(req: Request, res: Response) {
  try {
    const data = await deleteArticleById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении статьи' });
  }
}
