const mariadb = require('mariadb');
const crypto = require('crypto');

async function run() {
  const pool = mariadb.createPool({
    host: 'localhost',
    user: 'miyuki',
    password: 'ponosnik7',
    database: 'eotd20_wiki',
    port: 3306
  });

  let conn;
  try {
    conn = await pool.getConnection();
    const users = await conn.query('SELECT id FROM users WHERE invite_code IS NULL');
    for (const user of users) {
      const code = crypto.randomBytes(4).toString('hex');
      await conn.query('UPDATE users SET invite_code = ? WHERE id = ?', [code, user.id]);
      console.log(`Updated user ${user.id} with code ${code}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}
run();
