import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import {
  createScreenEncounter,
  finishScreenEncounter,
  getScreenEncounterById,
  listScreenEncounters,
  removeScreenEncounterParticipant,
  rebroadcastScreenEncounterOrder,
  startScreenEncounter,
  updateScreenEncounter,
  updateScreenEncounterMonsterHp,
} from './screen.service';

export async function listScreenEncountersHandler(req: Request, res: Response) {
  try {
    const data = await listScreenEncounters(req.query?.limit);
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка загрузки энкаунтеров' });
  }
}

export async function getScreenEncounterByIdHandler(req: Request, res: Response) {
  try {
    const data = await getScreenEncounterById(req.params.id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка загрузки энкаунтера' });
  }
}

export async function createScreenEncounterHandler(req: Request, res: Response) {
  try {
    const data = await createScreenEncounter(req.body || {}, req.user?.userId);
    res.status(201).json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка создания энкаунтера' });
  }
}

export async function updateScreenEncounterHandler(req: Request, res: Response) {
  try {
    const data = await updateScreenEncounter(req.params.id, req.body || {});
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка обновления энкаунтера' });
  }
}

export async function startScreenEncounterHandler(req: Request, res: Response) {
  try {
    const data = await startScreenEncounter(req.params.id, req.user?.userId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка старта боя' });
  }
}

export async function finishScreenEncounterHandler(req: Request, res: Response) {
  try {
    const data = await finishScreenEncounter(req.params.id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка завершения боя' });
  }
}

export async function rebroadcastScreenEncounterOrderHandler(req: Request, res: Response) {
  try {
    const data = await rebroadcastScreenEncounterOrder(req.params.id);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка переотправки порядка ходов' });
  }
}

export async function updateScreenEncounterMonsterHpHandler(req: Request, res: Response) {
  try {
    const data = await updateScreenEncounterMonsterHp(req.params.id, req.params.monsterId, req.body?.hp_current);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка обновления HP существа' });
  }
}

export async function removeScreenEncounterParticipantHandler(req: Request, res: Response) {
  try {
    const data = await removeScreenEncounterParticipant(req.params.id, req.params.monsterId);
    res.json(data);
  } catch (error) {
    const err = error as HttpError;
    res.status(err.status || 500).json({ error: err.message || 'Ошибка удаления существа из боя' });
  }
}
