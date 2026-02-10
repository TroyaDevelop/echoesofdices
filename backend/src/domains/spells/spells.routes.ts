import { Router } from 'express';
import { authenticateOptional, authenticateToken, requireStaff } from '../../middlewares/auth';
import {
  addSpellCommentHandler,
  createSpellHandler,
  deleteSpellCommentHandler,
  deleteSpellHandler,
  favoriteSpellHandler,
  getSpellHandler,
  getSpellLikesHandler,
  likeSpellHandler,
  listFavoritesHandler,
  listSpellCommentsHandler,
  listSpellsAdminHandler,
  listSpellsHandler,
  unlikeSpellHandler,
  unfavoriteSpellHandler,
  updateSpellHandler,
} from './spells.controller';

export const spellsRouter = Router();

spellsRouter.get('/', listSpellsHandler);
spellsRouter.get('/admin', authenticateToken, requireStaff, listSpellsAdminHandler);
spellsRouter.get('/favorites', authenticateToken, listFavoritesHandler);

spellsRouter.get('/:id(\\d+)', getSpellHandler);
spellsRouter.get('/:id(\\d+)/likes', authenticateOptional, getSpellLikesHandler);
spellsRouter.get('/:id(\\d+)/comments', listSpellCommentsHandler);
spellsRouter.post('/:id(\\d+)/comments', authenticateToken, addSpellCommentHandler);
spellsRouter.delete('/:id(\\d+)/comments/:commentId(\\d+)', authenticateToken, requireStaff, deleteSpellCommentHandler);
spellsRouter.post('/:id(\\d+)/like', authenticateToken, likeSpellHandler);
spellsRouter.delete('/:id(\\d+)/like', authenticateToken, unlikeSpellHandler);
spellsRouter.post('/:id(\\d+)/favorite', authenticateToken, favoriteSpellHandler);
spellsRouter.delete('/:id(\\d+)/favorite', authenticateToken, unfavoriteSpellHandler);

spellsRouter.post('/', authenticateToken, requireStaff, createSpellHandler);
spellsRouter.put('/:id(\\d+)', authenticateToken, requireStaff, updateSpellHandler);
spellsRouter.delete('/:id(\\d+)', authenticateToken, requireStaff, deleteSpellHandler);
