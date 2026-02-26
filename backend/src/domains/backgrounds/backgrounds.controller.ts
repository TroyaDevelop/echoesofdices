import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import {
  addComment,
  createBackgroundRecord,
  deleteBackgroundRecord,
  deleteComment,
  getBackgroundById,
  getBackgroundLikes,
  like,
  listBackgroundsAdminData,
  listBackgroundsPublic,
  listComments,
  unlike,
  updateBackgroundRecord,
} from './backgrounds.service';

export async function listBackgroundsHandler(_req: Request, res: Response) {
  try {
    const rows = await listBackgroundsPublic();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listBackgroundsAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listBackgroundsAdminData();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await getBackgroundById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getBackgroundLikesHandler(req: Request, res: Response) {
  try {
    const data = await getBackgroundLikes(Number(req.params.id), req.user?.userId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listBackgroundCommentsHandler(req: Request, res: Response) {
  try {
    const rows = await listComments(Number(req.params.id));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function addBackgroundCommentHandler(req: Request, res: Response) {
  try {
    const data = await addComment(Number(req.params.id), Number(req.user?.userId), req.body?.content);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении комментария' });
  }
}

export async function deleteBackgroundCommentHandler(req: Request, res: Response) {
  try {
    const data = await deleteComment(Number(req.params.id), Number(req.params.commentId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении комментария' });
  }
}

export async function likeBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await like(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при лайке' });
  }
}

export async function unlikeBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await unlike(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при снятии лайка' });
  }
}

export async function createBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await createBackgroundRecord(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении предыстории' });
  }
}

export async function updateBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await updateBackgroundRecord(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении предыстории' });
  }
}

export async function deleteBackgroundHandler(req: Request, res: Response) {
  try {
    const data = await deleteBackgroundRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении предыстории' });
  }
}
