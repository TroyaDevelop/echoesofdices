import { Request, Response } from 'express';
import * as service from './social.service';

export async function sendFriendRequest(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { inviteCode } = req.body;
  const result = await service.sendFriendRequest(userId, inviteCode);
  res.json(result);
}

export async function respondToFriendRequest(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendshipId, action } = req.body;
  const result = await service.respondToFriendRequest(userId, friendshipId, action);
  res.json(result);
}

export async function getFriendsList(req: Request, res: Response) {
  const userId = req.user!.userId;
  const result = await service.getFriendsList(userId);
  res.json(result);
}

export async function removeFriend(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendshipId } = req.params;
  const result = await service.removeFriend(userId, Number(friendshipId));
  res.json(result);
}

export async function getUserNotifications(req: Request, res: Response) {
  const userId = req.user!.userId;
  const result = await service.getUserNotifications(userId);
  res.json(result);
}

export async function readNotification(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { notificationId } = req.params;
  const result = await service.readNotification(userId, Number(notificationId));
  res.json(result);
}

export async function getFriendProfile(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.getFriendProfile(userId, Number(friendId));
  res.json(result);
}

export async function getFriendCharacters(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.getFriendCharacters(userId, Number(friendId));
  res.json(result);
}

export async function getFriendFavoriteSpells(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.getFriendFavoriteSpells(userId, Number(friendId));
  res.json(result);
}
