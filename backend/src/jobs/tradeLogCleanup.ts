import cron from 'node-cron';
import { query } from '../db/pool';

export async function cleanupTradeLogs(): Promise<void> {
  try {
    await query('DELETE FROM market_trade_logs WHERE created_at < (NOW() - INTERVAL 48 HOUR)', []);
  } catch {
    return;
  }
}

export function startTradeLogCleanup(): void {
  cleanupTradeLogs();
  const job = cron.schedule('0 * * * *', cleanupTradeLogs, {
    scheduled: false,
    timezone: 'UTC',
  });
  job.start();
}
