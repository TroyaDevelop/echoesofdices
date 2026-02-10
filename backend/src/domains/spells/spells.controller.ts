import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import {
  addComment,
  createSourceRecord,
  createSpellClassRecord,
  createSpellRecord,
  deleteComment,
  deleteSourceRecord,
  deleteSpellClassRecord,
  deleteSpellRecord,
  favoriteSpellById,
  getSpellById,
  getSpellLikes,
  like,
  listComments,
  listFavoriteSpells,
  listSourcesData,
  listSpellClasses,
  listSpellsAdminData,
  listSpellsPublic,
  unlike,
  unfavoriteSpellById,
  updateSpellRecord,
} from './spells.service';

export async function listSpellsHandler(_req: Request, res: Response) {
  try {
    const rows = await listSpellsPublic();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listSpellsAdminHandler(_req: Request, res: Response) {
  try {
    const rows = await listSpellsAdminData();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getSpellHandler(req: Request, res: Response) {
  try {
    const data = await getSpellById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function getSpellLikesHandler(req: Request, res: Response) {
  try {
    const data = await getSpellLikes(Number(req.params.id), req.user?.userId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listSpellCommentsHandler(req: Request, res: Response) {
  try {
    const rows = await listComments(Number(req.params.id));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function addSpellCommentHandler(req: Request, res: Response) {
  try {
    const data = await addComment(Number(req.params.id), Number(req.user?.userId), req.body?.content);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении комментария' });
  }
}

export async function deleteSpellCommentHandler(req: Request, res: Response) {
  try {
    const data = await deleteComment(Number(req.params.id), Number(req.params.commentId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении комментария' });
  }
}

export async function likeSpellHandler(req: Request, res: Response) {
  try {
    const data = await like(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при лайке' });
  }
}

export async function unlikeSpellHandler(req: Request, res: Response) {
  try {
    const data = await unlike(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при снятии лайка' });
  }
}

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

export async function createSpellHandler(req: Request, res: Response) {
  try {
    const data = await createSpellRecord(req.body || {});
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при добавлении заклинания' });
  }
}

export async function updateSpellHandler(req: Request, res: Response) {
  try {
    const data = await updateSpellRecord(Number(req.params.id), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении заклинания' });
  }
}

export async function deleteSpellHandler(req: Request, res: Response) {
  try {
    const data = await deleteSpellRecord(Number(req.params.id));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении заклинания' });
  }
}

export async function listFavoritesHandler(req: Request, res: Response) {
  try {
    const rows = await listFavoriteSpells(Number(req.user?.userId));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function favoriteSpellHandler(req: Request, res: Response) {
  try {
    const data = await favoriteSpellById(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка' });
  }
}

export async function unfavoriteSpellHandler(req: Request, res: Response) {
  try {
    const data = await unfavoriteSpellById(Number(req.params.id), Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка' });
  }
}
