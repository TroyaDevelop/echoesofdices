import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import { optimizeCharacterImage, uploadCharacterImage } from '../../middlewares/upload';
import {
	createMyCharacterHandler,
	deleteMyCharacterHandler,
	getMe,
	getMyCharacterHandler,
	listMyAwardsHandler,
	listMyCharactersHandler,
	listUserAwardsById,
	putMe,
	uploadMyCharacterImageHandler,
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
usersRouter.post('/me/character-image', authenticateToken, uploadCharacterImage.single('image'), optimizeCharacterImage, uploadMyCharacterImageHandler);
usersRouter.get('/:id(\\d+)/awards', listUserAwardsById);
usersRouter.get('/me/awards', authenticateToken, listMyAwardsHandler);
