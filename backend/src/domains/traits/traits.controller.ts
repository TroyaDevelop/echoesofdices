import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { addComment, createTraitRecord, deleteComment, deleteTraitRecord, getTraitById, getTraitLikes, like, listComments, listTraitsAdminData, listTraitsPublic, unlike, updateTraitRecord } from './traits.service';

export async function listTraitsHandler(_req: Request, res: Response) {
  try {
    const rows = await listTraitsPublic();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listTraitsAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listTraitsAdminData();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getTraitHandler(req: Request, res: Response) {
  try {
    const data = await getTraitById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getTraitLikesHandler(req: Request, res: Response) {
  try {
    const data = await getTraitLikes(Number(req.params.id), req.user?.userId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listTraitCommentsHandler(req: Request, res: Response) {
  try {
    const rows = await listComments(Number(req.params.id));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function addTraitCommentHandler(req: Request, res: Response) {
  try {
    const data = await addComment(Number(req.params.id), Number(req.user?.userId), req.body?.content);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении комментария' });
  }
}

export async function deleteTraitCommentHandler(req: Request, res: Response) {
  try {
    const data = await deleteComment(Number(req.params.id), Number(req.params.commentId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении комментария' });
  }
}

export async function likeTraitHandler(req: Request, res: Response) {
  try {
    const data = await like(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при лайке' });
  }
}

export async function unlikeTraitHandler(req: Request, res: Response) {
  try {
    const data = await unlike(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при снятии лайка' });
  }
}

export async function createTraitHandler(req: Request, res: Response) {
  try {
    const data = await createTraitRecord(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении черты' });
  }
}

export async function updateTraitHandler(req: Request, res: Response) {
  try {
    const data = await updateTraitRecord(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении черты' });
  }
}

export async function deleteTraitHandler(req: Request, res: Response) {
  try {
    const data = await deleteTraitRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении черты' });
  }
}
