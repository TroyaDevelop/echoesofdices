import mariadb from 'mariadb';

let pool: mariadb.Pool | undefined;
let poolInitError: Error | undefined;

type PoolConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
  multipleStatements: boolean;
};

function getPoolConfigFromEnv(): PoolConfig | null {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const portRaw = process.env.DB_PORT;

  if (!host || !user || !database) return null;

  const port = portRaw ? Number(portRaw) : 3306;

  return {
    host,
    port: Number.isFinite(port) ? port : 3306,
    user,
    password,
    database,
    connectionLimit: 5,
    multipleStatements: false,
  };
}

function ensurePool(): void {
  if (pool || poolInitError) return;

  const cfg = getPoolConfigFromEnv();
  if (!cfg) {
    poolInitError = new Error('DB is not configured (missing DB_HOST/DB_USER/DB_NAME)');
    return;
  }

  try {
    pool = mariadb.createPool(cfg);
  } catch (e) {
    poolInitError = e as Error;
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  ensurePool();

  if (!pool) {
    throw poolInitError || new Error('DB pool is not available');
  }

  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    return await conn.query(sql, params);
  } finally {
    if (conn) conn.release();
  }
}
