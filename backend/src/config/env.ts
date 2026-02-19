import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: false });

export const PORT = Number(process.env.PORT || 5017);
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const ECHOESROOT_LOGIN = process.env.ECHOESROOT_LOGIN;
export const ECHOESROOT_PASSWORD = process.env.ECHOESROOT_PASSWORD;
export const MARKET_BOT_INTEGRATION_KEY =
	process.env.MARKET_BOT_INTEGRATION_KEY ||
	process.env.MARKET_INTEGRATION_KEY ||
	'';
