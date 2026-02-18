import { Router } from 'express';
import { authenticateToken, requireMasterOrAdmin } from '../../middlewares/auth';
import {
  optimizeTacticalMapImage,
  optimizeTacticalTokenImage,
  uploadTacticalMapImage,
  uploadTacticalTokenImage,
} from '../../middlewares/upload';
import {
  addScreenEncounterParticipantFromBestiaryHandler,
  createScreenEncounterHandler,
  finishScreenEncounterHandler,
  getScreenEncounterByIdHandler,
  listScreenEncountersHandler,
  removeScreenEncounterParticipantHandler,
  removeScreenEncounterTokenHandler,
  rebroadcastScreenEncounterOrderHandler,
  startScreenEncounterHandler,
  updateScreenEncounterHandler,
  updateScreenEncounterMapConfigHandler,
  updateScreenEncounterMapTokensHandler,
  updateScreenEncounterParticipantInitiativeHandler,
  updateScreenEncounterMonsterHpHandler,
  updateScreenEncounterTokenImageHandler,
} from './screen.controller';

export const screenRouter = Router();

screenRouter.get('/encounters', authenticateToken, requireMasterOrAdmin, listScreenEncountersHandler);
screenRouter.get('/encounters/:id(\\d+)', authenticateToken, requireMasterOrAdmin, getScreenEncounterByIdHandler);

screenRouter.post('/encounters', authenticateToken, requireMasterOrAdmin, createScreenEncounterHandler);
screenRouter.put('/encounters/:id(\\d+)', authenticateToken, requireMasterOrAdmin, updateScreenEncounterHandler);
screenRouter.post('/encounters/:id(\\d+)/start', authenticateToken, requireMasterOrAdmin, startScreenEncounterHandler);
screenRouter.post('/encounters/:id(\\d+)/rebroadcast-order', authenticateToken, requireMasterOrAdmin, rebroadcastScreenEncounterOrderHandler);
screenRouter.delete('/encounters/:id(\\d+)/finish', authenticateToken, requireMasterOrAdmin, finishScreenEncounterHandler);
screenRouter.post('/encounters/:id(\\d+)/monsters', authenticateToken, requireMasterOrAdmin, addScreenEncounterParticipantFromBestiaryHandler);
screenRouter.patch('/encounters/:id(\\d+)/monsters/:monsterId/hp', authenticateToken, requireMasterOrAdmin, updateScreenEncounterMonsterHpHandler);
screenRouter.patch('/encounters/:id(\\d+)/monsters/:monsterId/initiative', authenticateToken, requireMasterOrAdmin, updateScreenEncounterParticipantInitiativeHandler);
screenRouter.delete('/encounters/:id(\\d+)/monsters/:monsterId', authenticateToken, requireMasterOrAdmin, removeScreenEncounterParticipantHandler);

screenRouter.put('/encounters/:id(\\d+)/map', authenticateToken, requireMasterOrAdmin, uploadTacticalMapImage.single('image'), optimizeTacticalMapImage, updateScreenEncounterMapConfigHandler);
screenRouter.put('/encounters/:id(\\d+)/map/tokens', authenticateToken, requireMasterOrAdmin, updateScreenEncounterMapTokensHandler);
screenRouter.put('/encounters/:id(\\d+)/map/tokens/:tokenId/image', authenticateToken, requireMasterOrAdmin, uploadTacticalTokenImage.single('image'), optimizeTacticalTokenImage, updateScreenEncounterTokenImageHandler);
screenRouter.delete('/encounters/:id(\\d+)/map/tokens/:tokenId', authenticateToken, requireMasterOrAdmin, removeScreenEncounterTokenHandler);
