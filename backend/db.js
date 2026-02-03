const mariadb = require('mariadb');

let pool;
let poolInitError;

function getPoolConfigFromEnv() {
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

function ensurePool() {
  if (pool || poolInitError) return;

  const cfg = getPoolConfigFromEnv();
  if (!cfg) {
    poolInitError = new Error('DB is not configured (missing DB_HOST/DB_USER/DB_NAME)');
    return;
  }

  try {
    pool = mariadb.createPool(cfg);
  } catch (e) {
    poolInitError = e;
  }
}

async function query(sql, params = []) {
  ensurePool();

  if (!pool) {
    throw poolInitError || new Error('DB pool is not available');
  }

  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(sql, params);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  query,
};
