import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import * as controller from './social.controller';

const router = Router();

router.use(authenticateToken);

router.post('/friends/request', controller.sendFriendRequest);
router.post('/friends/respond', controller.respondToFriendRequest);
router.get('/friends', controller.getFriendsList);
router.delete('/friends/:friendshipId', controller.removeFriend);

router.get('/notifications', controller.getUserNotifications);
router.post('/notifications/:notificationId/read', controller.readNotification);

router.get('/profile/:friendId', controller.getFriendProfile);
router.get('/profile/:friendId/characters', controller.getFriendCharacters);
router.get('/profile/:friendId/favorites', controller.getFriendFavoriteSpells);

export default router;
