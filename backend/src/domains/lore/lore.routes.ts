import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createLocationHandler, createLoreHandler, deleteLocationHandler, deleteLoreHandler, getLoreHandler, listLocationsHandler, listLoreAdminHandler, listLoreHandler, updateLoreHandler } from './lore.controller';

export const loreRouter = Router();

loreRouter.get('/', listLoreHandler);
loreRouter.get('/admin', authenticateToken, requireStaff, listLoreAdminHandler);
loreRouter.get('/locations', listLocationsHandler);
loreRouter.get('/locations/admin', authenticateToken, requireStaff, listLocationsHandler);
loreRouter.post('/locations', authenticateToken, requireStaff, createLocationHandler);
loreRouter.delete('/locations/:id(\\d+)', authenticateToken, requireStaff, deleteLocationHandler);
loreRouter.get('/:slug', getLoreHandler);
loreRouter.post('/', authenticateToken, requireStaff, createLoreHandler);
loreRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateLoreHandler);
loreRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteLoreHandler);
