import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createSourceHandler, deleteSourceHandler, listSourcesHandler } from './sources.controller';

export const sourcesRouter = Router();

sourcesRouter.get('/', listSourcesHandler);
sourcesRouter.get('/admin', authenticateToken, requireStaff, listSourcesHandler);
sourcesRouter.post('/', authenticateToken, requireStaff, createSourceHandler);
sourcesRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteSourceHandler);
