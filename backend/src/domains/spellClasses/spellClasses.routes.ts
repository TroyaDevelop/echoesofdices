import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createSpellClassHandler, deleteSpellClassHandler, listSpellClassesHandler } from './spellClasses.controller';

export const spellClassesRouter = Router();

spellClassesRouter.get('/', listSpellClassesHandler);
spellClassesRouter.get('/admin', authenticateToken, requireStaff, listSpellClassesHandler);
spellClassesRouter.post('/', authenticateToken, requireStaff, createSpellClassHandler);
spellClassesRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteSpellClassHandler);
