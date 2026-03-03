import { Request, Response } from 'express';
import * as service from './social.service';

export async function sendFriendRequest(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { inviteCode } = req.body;
  const result = await service.sendFriendRequest(userId, inviteCode);
  res.json(result);
}

export async function sendFriendRequestByUserId(req: Request, res: Response) {
  const userId = req.user!.userId;
  const targetUserId = Number(req.body?.targetUserId);
  const result = await service.sendFriendRequestByUserId(userId, targetUserId);
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

export async function getFriendFriends(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.getFriendFriends(userId, Number(friendId));
  res.json(result);
}

export async function getCommunityAdventurers(req: Request, res: Response) {
  const userId = req.user!.userId;
  const search = String(req.query?.search || '');
  const result = await service.getCommunityAdventurers(userId, search);
  res.json(result);
}

export async function getMasterReviews(req: Request, res: Response) {
  const { friendId } = req.params;
  const result = await service.getMasterReviews(Number(friendId));
  res.json(result);
}

export async function addMasterReview(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const content = String(req.body?.content || '');
  const result = await service.addMasterReview(userId, Number(friendId), content);
  res.status(201).json(result);
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

export async function likeFriendProfile(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.likeFriendProfile(userId, Number(friendId));
  res.json(result);
}

export async function grantHonorToMaster(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.grantHonorToMaster(userId, Number(friendId));
  res.json(result);
}

export async function revokeHonorFromMaster(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const result = await service.revokeHonorFromMaster(userId, Number(friendId));
  res.json(result);
}

export async function getGiftShop(req: Request, res: Response) {
  const userId = req.user!.userId;
  const result = await service.getGiftShop(userId);
  res.json(result);
}

export async function giftToUser(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { friendId } = req.params;
  const giftId = Number(req.body?.gift_id);
  const result = await service.giftToUser(userId, Number(friendId), giftId);
  res.status(201).json(result);
}

export async function getMyShowcase(req: Request, res: Response) {
  const userId = req.user!.userId;
  const result = await service.getMyShowcase(userId);
  res.json(result);
}

export async function updateMyShowcase(req: Request, res: Response) {
  const userId = req.user!.userId;
  const slots = req.body?.slots;
  const result = await service.updateMyShowcase(userId, slots);
  res.json(result);
}

export async function getFriendShowcase(req: Request, res: Response) {
  const { friendId } = req.params;
  const result = await service.getFriendShowcase(Number(friendId));
  res.json(result);
}
