import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import {
  changeFlags,
  createAwardRecord,
  createKey,
  deleteAwardRecord,
  getAwards,
  getRegistrationKeys,
  getUsers,
  grantAwardToUser,
  removeUser,
  revokeAwardFromUser,
  updateAwardRecord,
} from './admin.service';

export async function listUsersHandler(_req: Request, res: Response) {
  try {
    const rows = await getUsers();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const currentUserId = Number(req.user?.userId);
    const data = await removeUser(id, currentUserId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении пользователя' });
  }
}

export async function updateFlagsHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = await changeFlags(id, req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении флагов' });
  }
}

export async function createKeyHandler(req: Request, res: Response) {
  try {
    const data = await createKey(Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании ключа' });
  }
}

export async function listKeysHandler(_req: Request, res: Response) {
  try {
    const rows = await getRegistrationKeys();
    res.json(rows);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listAwardsHandler(_req: Request, res: Response) {
  try {
    const rows = await getAwards();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createAwardHandler(req: Request, res: Response) {
  try {
    const name = String(req.body?.name || '').trim();
    const description = req.body?.description ? String(req.body.description).trim() || null : null;
    const imageUrl = req.file ? `/uploads/awards/${req.file.filename}` : null;
    const data = await createAwardRecord(name, description, imageUrl);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка создания награды' });
  }
}

export async function updateAwardHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const name = req.body?.name !== undefined ? String(req.body.name).trim() : '';
    const description = req.body?.description !== undefined ? (req.body.description ? String(req.body.description).trim() : null) : undefined;
    const imageUrl = req.file ? `/uploads/awards/${req.file.filename}` : undefined;
    const data = await updateAwardRecord(id, name, description, imageUrl);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка обновления награды' });
  }
}

export async function deleteAwardHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = await deleteAwardRecord(id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка удаления награды' });
  }
}

export async function grantAwardHandler(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const awardId = Number(req.body?.award_id);
    const data = await grantAwardToUser(userId, awardId, Number(req.user?.userId));
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка выдачи награды' });
  }
}

export async function revokeAwardHandler(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const awardId = Number(req.params.awardId);
    const data = await revokeAwardFromUser(userId, awardId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка отзыва награды' });
  }
}
