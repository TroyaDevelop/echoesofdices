import { Router } from 'express';
import { authenticateToken, requireMasterOrAdmin } from '../../middlewares/auth';
import {
  createScreenEncounterHandler,
  finishScreenEncounterHandler,
  getScreenEncounterByIdHandler,
  listScreenEncountersHandler,
  rebroadcastScreenEncounterOrderHandler,
  startScreenEncounterHandler,
  updateScreenEncounterHandler,
  updateScreenEncounterMonsterHpHandler,
} from './screen.controller';

export const screenRouter = Router();

screenRouter.get('/encounters', authenticateToken, requireMasterOrAdmin, listScreenEncountersHandler);
screenRouter.get('/encounters/:id(\\d+)', authenticateToken, requireMasterOrAdmin, getScreenEncounterByIdHandler);

screenRouter.post('/encounters', authenticateToken, requireMasterOrAdmin, createScreenEncounterHandler);
screenRouter.put('/encounters/:id(\\d+)', authenticateToken, requireMasterOrAdmin, updateScreenEncounterHandler);
screenRouter.post('/encounters/:id(\\d+)/start', authenticateToken, requireMasterOrAdmin, startScreenEncounterHandler);
screenRouter.post('/encounters/:id(\\d+)/rebroadcast-order', authenticateToken, requireMasterOrAdmin, rebroadcastScreenEncounterOrderHandler);
screenRouter.delete('/encounters/:id(\\d+)/finish', authenticateToken, requireMasterOrAdmin, finishScreenEncounterHandler);
screenRouter.patch('/encounters/:id(\\d+)/monsters/:monsterId/hp', authenticateToken, requireMasterOrAdmin, updateScreenEncounterMonsterHpHandler);
