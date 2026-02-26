import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import { extractUserFlags } from '../../utils/permissions';
import {
  blockUserById,
  claimRegistrationKey,
  findUserByLogin,
  findUserLoginExists,
  increaseFailedLoginAttempts,
  insertUser,
  markRegistrationKeyUsed,
  resetFailedLoginAttempts,
} from './auth.repository';

export async function loginUser(login: string, password: string) {
  const loginValue = String(login || '').trim();
  const passwordValue = String(password || '');
  if (!loginValue || !passwordValue) throw new HttpError(400, 'Заполните логин и пароль');

  const user = await findUserByLogin(loginValue);
  if (!user) throw new HttpError(401, 'Неверные учетные данные');

  if (Number(user.is_blocked) === 1) {
    throw new HttpError(403, 'Вы заблокированы');
  }

  const validPassword = await bcrypt.compare(passwordValue, String(user.password));
  if (!validPassword) {
    await increaseFailedLoginAttempts(Number(user.id));
    const nextAttempts = Number(user.failed_login_attempts || 0) + 1;
    if (nextAttempts >= 3) {
      await blockUserById(Number(user.id));
      throw new HttpError(403, 'Вы заблокированы');
    }
    throw new HttpError(401, 'Неверные учетные данные');
  }

  if (Number(user.failed_login_attempts || 0) > 0) {
    await resetFailedLoginAttempts(Number(user.id));
  }

  const flags = extractUserFlags(user);
  const token = jwt.sign({ userId: user.id, login: user.login, flags }, JWT_SECRET, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: user.id,
      login: user.login,
      role: 'user',
      flags,
      nickname: user.nickname || null,
    },
  };
}

export async function registerUser(input: { login: string; password: string; nickname: string; key: string }) {
  const loginValue = String(input.login || '').trim();
  const passwordValue = String(input.password || '');
  const nicknameValue = String(input.nickname || '').trim();
  const keyValue = String(input.key || '').trim();

  if (!loginValue || !passwordValue || !nicknameValue || !keyValue) {
    throw new HttpError(400, 'Заполните логин, пароль, никнейм и ключ регистрации');
  }

  if (passwordValue.length < 6) {
    throw new HttpError(400, 'Пароль должен быть минимум 6 символов');
  }

  const exists = await findUserLoginExists(loginValue);
  if (exists) throw new HttpError(409, 'Пользователь с таким логином уже существует');

  const claim = await claimRegistrationKey(keyValue);
  const affected = Number(claim?.affectedRows || 0);
  if (affected < 1) throw new HttpError(403, 'Неверный или уже использованный ключ регистрации');

  const hashed = await bcrypt.hash(passwordValue, 10);
  const inviteCode = crypto.randomBytes(4).toString('hex');
  const result = await insertUser(loginValue, hashed, 'user', nicknameValue, inviteCode);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  await markRegistrationKeyUsed(insertedId, keyValue);

  return {
    id: insertedId,
    login: loginValue,
    nickname: nicknameValue,
    role: 'user',
  };
}
