import { Router } from 'express';
import { authenticateToken, requireAdminOnly } from '../../middlewares/auth';
import { optimizeAwardImage, uploadAwardImage } from '../../middlewares/upload';
import {
  createAwardHandler,
  createKeyHandler,
  deleteAwardHandler,
  deleteUserHandler,
  grantAwardHandler,
  listAwardsHandler,
  listKeysHandler,
  listUsersHandler,
  revokeAwardHandler,
  updateAwardHandler,
  updateFlagsHandler,
} from './admin.controller';

export const adminRouter = Router();

adminRouter.get('/users', authenticateToken, requireAdminOnly, listUsersHandler);
adminRouter.delete('/users/:id(\\d+)', authenticateToken, requireAdminOnly, deleteUserHandler);
adminRouter.patch('/users/:id(\\d+)/flags', authenticateToken, requireAdminOnly, updateFlagsHandler);

adminRouter.post('/registration-keys', authenticateToken, requireAdminOnly, createKeyHandler);
adminRouter.get('/registration-keys', authenticateToken, requireAdminOnly, listKeysHandler);

adminRouter.get('/awards', authenticateToken, requireAdminOnly, listAwardsHandler);
adminRouter.post('/awards', authenticateToken, requireAdminOnly, uploadAwardImage.single('image'), optimizeAwardImage, createAwardHandler);
adminRouter.put('/awards/:id(\\d+)', authenticateToken, requireAdminOnly, uploadAwardImage.single('image'), optimizeAwardImage, updateAwardHandler);
adminRouter.delete('/awards/:id(\\d+)', authenticateToken, requireAdminOnly, deleteAwardHandler);

adminRouter.post('/users/:userId(\\d+)/awards', authenticateToken, requireAdminOnly, grantAwardHandler);
adminRouter.delete('/users/:userId(\\d+)/awards/:awardId(\\d+)', authenticateToken, requireAdminOnly, revokeAwardHandler);
