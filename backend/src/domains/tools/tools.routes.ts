import { Router } from 'express';
import { toolsController } from './tools.controller';

export const toolsRouter = Router();

toolsRouter.post('/spellcheck', toolsController.spellcheck);
