import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import {
  createMyCharacter,
  deleteMyCharacter,
  getMyAwards,
  getMyCharacter,
  getProfile,
  listMyCharacters,
  getUserAwards,
  updateMyCharacter,
  updateProfile,
} from './users.service';

export async function getMe(req: Request, res: Response) {
  try {
    const data = await getProfile(Number(req.user?.userId));
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function putMe(req: Request, res: Response) {
  try {
    const data = await updateProfile(Number(req.user?.userId), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении профиля' });
  }
}

export async function listUserAwardsById(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Некорректный id' });
    const rows = await getUserAwards(userId);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listMyAwardsHandler(req: Request, res: Response) {
  try {
    const rows = await getMyAwards(Number(req.user?.userId));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function listMyCharactersHandler(req: Request, res: Response) {
  try {
    const rows = await listMyCharacters(Number(req.user?.userId));
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 503).json({ error: err.message || 'База данных недоступна' });
  }
}

export async function createMyCharacterHandler(req: Request, res: Response) {
  try {
    const data = await createMyCharacter(Number(req.user?.userId), req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при создании листа персонажа' });
  }
}

export async function getMyCharacterHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });
    const data = await getMyCharacter(Number(req.user?.userId), id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 404).json({ error: err.message || 'Лист персонажа не найден' });
  }
}

export async function updateMyCharacterHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });
    const data = await updateMyCharacter(Number(req.user?.userId), id, req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при обновлении листа персонажа' });
  }
}

export async function deleteMyCharacterHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });
    const data = await deleteMyCharacter(Number(req.user?.userId), id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка при удалении листа персонажа' });
  }
}

export async function uploadMyCharacterImageHandler(req: Request, res: Response) {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({ error: 'Файл изображения не загружен' });
    }
    return res.json({ image_url: `/uploads/characters/${req.file.filename}` });
  } catch (error) {
    const err = error as HttpError;
    return res.status(err.status || 500).json({ error: err.message || 'Ошибка загрузки изображения' });
  }
}
