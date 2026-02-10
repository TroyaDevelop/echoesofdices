import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import {
	createMyCharacterHandler,
	deleteMyCharacterHandler,
	getMe,
	getMyCharacterHandler,
	listMyAwardsHandler,
	listMyCharactersHandler,
	listUserAwardsById,
	putMe,
	updateMyCharacterHandler,
} from './users.controller';

export const usersRouter = Router();

usersRouter.get('/me', authenticateToken, getMe);
usersRouter.put('/me', authenticateToken, putMe);
usersRouter.get('/me/characters', authenticateToken, listMyCharactersHandler);
usersRouter.post('/me/characters', authenticateToken, createMyCharacterHandler);
usersRouter.get('/me/characters/:id(\\d+)', authenticateToken, getMyCharacterHandler);
usersRouter.put('/me/characters/:id(\\d+)', authenticateToken, updateMyCharacterHandler);
usersRouter.delete('/me/characters/:id(\\d+)', authenticateToken, deleteMyCharacterHandler);
usersRouter.get('/:id(\\d+)/awards', listUserAwardsById);
usersRouter.get('/me/awards', authenticateToken, listMyAwardsHandler);
