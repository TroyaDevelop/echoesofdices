import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import { login, register, verify } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/verify', authenticateToken, verify);
authRouter.post('/register', register);
