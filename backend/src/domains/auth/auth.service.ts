import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import { claimRegistrationKey, findUserByLogin, findUserLoginExists, insertUser, markRegistrationKeyUsed } from './auth.repository';

export async function loginUser(login: string, password: string) {
  const loginValue = String(login || '').trim();
  const passwordValue = String(password || '');
  if (!loginValue || !passwordValue) throw new HttpError(400, 'Заполните логин и пароль');

  const user = await findUserByLogin(loginValue);
  if (!user) throw new HttpError(401, 'Неверные учетные данные');

  const validPassword = await bcrypt.compare(passwordValue, String(user.password));
  if (!validPassword) throw new HttpError(401, 'Неверные учетные данные');

  const token = jwt.sign({ userId: user.id, login: user.login, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: user.id,
      login: user.login,
      role: user.role,
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
  const result = await insertUser(loginValue, hashed, 'user', nicknameValue);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  await markRegistrationKeyUsed(insertedId, keyValue);

  return {
    id: insertedId,
    login: loginValue,
    nickname: nicknameValue,
    role: 'user',
  };
}
