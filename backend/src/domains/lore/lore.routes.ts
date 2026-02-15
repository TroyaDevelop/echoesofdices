import { Router } from 'express';
import { authenticateToken, requireMasterOrAdmin } from '../../middlewares/auth';
import { createLocationHandler, createLoreHandler, deleteLocationHandler, deleteLoreHandler, getLoreHandler, listLocationsHandler, listLoreAdminHandler, listLoreHandler, updateLoreHandler } from './lore.controller';

export const loreRouter = Router();

loreRouter.get('/', listLoreHandler);
loreRouter.get('/admin', authenticateToken, requireMasterOrAdmin, listLoreAdminHandler);
loreRouter.get('/locations', listLocationsHandler);
loreRouter.get('/locations/admin', authenticateToken, requireMasterOrAdmin, listLocationsHandler);
loreRouter.post('/locations', authenticateToken, requireMasterOrAdmin, createLocationHandler);
loreRouter.delete('/locations/:id(\\d+)', authenticateToken, requireMasterOrAdmin, deleteLocationHandler);
loreRouter.get('/:slug', getLoreHandler);
loreRouter.post('/', authenticateToken, requireMasterOrAdmin, createLoreHandler);
loreRouter.put('/:id(\\d+)', authenticateToken, requireMasterOrAdmin, updateLoreHandler);
loreRouter.delete('/:id(\\d+)', authenticateToken, requireMasterOrAdmin, deleteLoreHandler);
