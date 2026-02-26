import { Router } from 'express';
import { authenticateToken, requireStaff } from '../../middlewares/auth';
import { createSpellSchoolHandler, deleteSpellSchoolHandler, listSpellSchoolsHandler } from './spellSchools.controller';

export const spellSchoolsRouter = Router();

spellSchoolsRouter.get('/', listSpellSchoolsHandler);
spellSchoolsRouter.get('/admin', authenticateToken, requireStaff, listSpellSchoolsHandler);
spellSchoolsRouter.post('/', authenticateToken, requireStaff, createSpellSchoolHandler);
spellSchoolsRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteSpellSchoolHandler);
