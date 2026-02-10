import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { addWondrousComment, createWondrousItem, deleteWondrousComment, deleteWondrousItem, getWondrousItemById, getWondrousLikes, likeWondrousItem, listWondrousComments, listWondrousItems, listWondrousItemsAdmin, unlikeWondrousItem, updateWondrousItem } from './wondrous.service';

export async function listWondrousHandler(_req: Request, res: Response) {
  try {
    const rows = await listWondrousItems();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listWondrousAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listWondrousItemsAdmin();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getWondrousHandler(req: Request, res: Response) {
  try {
    const data = await getWondrousItemById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getWondrousLikesHandler(req: Request, res: Response) {
  try {
    const data = await getWondrousLikes(Number(req.params.id), req.user?.userId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listWondrousCommentsHandler(req: Request, res: Response) {
  try {
    const rows = await listWondrousComments(Number(req.params.id));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function addWondrousCommentHandler(req: Request, res: Response) {
  try {
    const data = await addWondrousComment(Number(req.params.id), Number(req.user?.userId), req.body?.content);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении комментария' });
  }
}

export async function deleteWondrousCommentHandler(req: Request, res: Response) {
  try {
    const data = await deleteWondrousComment(Number(req.params.id), Number(req.params.commentId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении комментария' });
  }
}

export async function likeWondrousHandler(req: Request, res: Response) {
  try {
    const data = await likeWondrousItem(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при лайке' });
  }
}

export async function unlikeWondrousHandler(req: Request, res: Response) {
  try {
    const data = await unlikeWondrousItem(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при снятии лайка' });
  }
}

export async function createWondrousHandler(req: Request, res: Response) {
  try {
    const data = await createWondrousItem(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении предмета' });
  }
}

export async function updateWondrousHandler(req: Request, res: Response) {
  try {
    const data = await updateWondrousItem(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении предмета' });
  }
}

export async function deleteWondrousHandler(req: Request, res: Response) {
  try {
    const data = await deleteWondrousItem(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении предмета' });
  }
}
