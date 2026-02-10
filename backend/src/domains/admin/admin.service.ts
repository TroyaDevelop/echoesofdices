import crypto from 'crypto';
import { HttpError } from '../../utils/httpError';
import {
  createRegistrationKey,
  deleteAward,
  deleteUserById,
  findAwardById,
  findUserById,
  grantAward,
  insertAward,
  listAwards,
  listRegistrationKeys,
  listUsers,
  revokeAward,
  updateAward,
  updateUserRole,
} from './admin.repository';

export async function getUsers() {
  return listUsers();
}

export async function removeUser(id: number, currentUserId: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  if (Number.isFinite(currentUserId) && id === currentUserId) throw new HttpError(403, 'Нельзя удалить самого себя');
  const user = await findUserById(id);
  if (!user) throw new HttpError(404, 'Пользователь не найден');
  await deleteUserById(id);
  return { ok: true };
}

export async function changeRole(id: number, roleValue: string) {
  const role = String(roleValue || '').trim().toLowerCase();
  if (role !== 'user' && role !== 'editor' && role !== 'admin') {
    throw new HttpError(400, 'Роль должна быть user, editor или admin');
  }
  const user = await findUserById(id);
  if (!user) throw new HttpError(404, 'Пользователь не найден');
  await updateUserRole(id, role);
  return { id, role };
}

export async function createKey(createdBy: number) {
  const regKey = crypto.randomBytes(24).toString('base64url');
  const result = await createRegistrationKey(regKey, createdBy);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, key: regKey };
}

export async function getRegistrationKeys() {
  return listRegistrationKeys();
}

export async function getAwards() {
  return listAwards();
}

export async function createAwardRecord(name: string, description: string | null, imageUrl: string | null) {
  const nameValue = String(name || '').trim();
  if (!nameValue) throw new HttpError(400, 'Название награды обязательно');
  if (nameValue.length > 200) throw new HttpError(400, 'Название слишком длинное');
  const result = await insertAward(nameValue, description, imageUrl);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  return { id: insertedId, name: nameValue, description, image_url: imageUrl };
}

export async function updateAwardRecord(id: number, name: string, description?: string | null, imageUrl?: string | null) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findAwardById(id);
  if (!existing) throw new HttpError(404, 'Награда не найдена');
  const nameValue = String(name || '').trim();
  if (!nameValue) throw new HttpError(400, 'Название награды обязательно');
  const finalDescription = description === undefined ? existing.description : description;
  const finalImageUrl = imageUrl === undefined ? existing.image_url : imageUrl;
  await updateAward(id, nameValue, finalDescription, finalImageUrl);
  return { id, name: nameValue, description: finalDescription, image_url: finalImageUrl };
}

export async function deleteAwardRecord(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteAward(id);
  return { ok: true };
}

export async function grantAwardToUser(userId: number, awardId: number, grantedBy: number) {
  if (!Number.isFinite(userId) || !Number.isFinite(awardId)) throw new HttpError(400, 'Некорректные параметры');
  await grantAward(userId, awardId, grantedBy);
  return { ok: true };
}

export async function revokeAwardFromUser(userId: number, awardId: number) {
  if (!Number.isFinite(userId) || !Number.isFinite(awardId)) throw new HttpError(400, 'Некорректные параметры');
  await revokeAward(userId, awardId);
  return { ok: true };
}
