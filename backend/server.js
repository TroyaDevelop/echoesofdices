const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const path = require('path');

require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: false });

const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 5017;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'editor') {
    return res.status(403).json({ error: 'Требуются права редактора' });
  }
  next();
};

const requireStaff = requireAdmin;

app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Заполните логин и пароль' });
    }

    const rows = await query('SELECT id, login, password, role FROM users WHERE login = ? LIMIT 1', [String(login).trim()]);
    const user = rows && rows[0];
    if (!user) return res.status(401).json({ error: 'Неверные учетные данные' });

    const validPassword = await bcrypt.compare(String(password), String(user.password));
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { userId: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      login: req.user.login,
      role: req.user.role
    }
  });
});

async function safeQuery(sql, params = []) {
  try {
    await query(sql, params);
  } catch {
    return;
  }
}

async function ensureRuntimeSchema() {
  await query(
    "CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, login VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('editor','user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    []
  );

  await safeQuery("UPDATE users SET role = 'editor' WHERE role = 'admin'", []);
  await safeQuery("ALTER TABLE users MODIFY COLUMN role ENUM('editor','user') DEFAULT 'user'", []);

  await safeQuery('ALTER TABLE users CHANGE COLUMN email login VARCHAR(255) NOT NULL', []);
  await safeQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR(255)', []);
  await safeQuery('ALTER TABLE users ADD UNIQUE INDEX uniq_users_login (login)', []);

  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100)', []);

  await query(
    'CREATE TABLE IF NOT EXISTS registration_keys (id INT PRIMARY KEY AUTO_INCREMENT, reg_key VARCHAR(80) UNIQUE NOT NULL, is_active TINYINT(1) NOT NULL DEFAULT 1, created_by INT NULL, used_by INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, used_at TIMESTAMP NULL, INDEX idx_reg_keys_active_used (is_active, used_at), INDEX idx_reg_keys_created_at (created_at))',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_likes (id INT PRIMARY KEY AUTO_INCREMENT, spell_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uniq_spell_user (spell_id, user_id), INDEX idx_spell_likes_spell (spell_id), FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    'CREATE TABLE IF NOT EXISTS spell_comments (id INT PRIMARY KEY AUTO_INCREMENT, spell_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_spell_comments_spell_created (spell_id, created_at), FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS news_posts (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content LONGTEXT NOT NULL, excerpt TEXT, author_id INT, status ENUM('draft','published') DEFAULT 'draft', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_news_status_created (status, created_at))",
    []
  );

  await query(
    "CREATE TABLE IF NOT EXISTS spells (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), level TINYINT UNSIGNED NOT NULL DEFAULT 0, school VARCHAR(100), theme VARCHAR(32) DEFAULT 'none', casting_time VARCHAR(255), range_text VARCHAR(255), components VARCHAR(50), duration VARCHAR(255), classes VARCHAR(255), subclasses VARCHAR(255), source VARCHAR(100), source_pages VARCHAR(50), description LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_spells_name (name))",
    []
  );

  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS name_en VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS casting_time VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS range_text VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS duration VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS classes VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS subclasses VARCHAR(255)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS source VARCHAR(100)', []);
  await query('ALTER TABLE spells ADD COLUMN IF NOT EXISTS source_pages VARCHAR(50)', []);
  await query("ALTER TABLE spells ADD COLUMN IF NOT EXISTS theme VARCHAR(32) DEFAULT 'none'", []);

  const anyEditor = await query("SELECT id FROM users WHERE role = 'editor' LIMIT 1", []);
  if (!anyEditor || !anyEditor[0]) {
    const anyUser = await query('SELECT id FROM users ORDER BY id ASC LIMIT 1', []);
    if (anyUser && anyUser[0]) {
      await query("UPDATE users SET role = 'editor' WHERE id = ?", [anyUser[0].id]);
    }
  }

  const defaultEditorLoginRaw = process.env.ECHOESROOT_LOGIN;
  const defaultEditorPasswordRaw = process.env.ECHOESROOT_PASSWORD;
  const defaultEditorLogin = String(defaultEditorLoginRaw || 'echoesroot').trim() || 'echoesroot';
  const defaultEditorPassword = String(defaultEditorPasswordRaw || 'echoesoftimespunguinandpigeon');

  const existing = await query('SELECT id, login, password, role FROM users WHERE login = ? LIMIT 1', [defaultEditorLogin]);
  const user = existing && existing[0];
  if (!user) {
    const hashed = await bcrypt.hash(defaultEditorPassword, 10);
    await query('INSERT INTO users (login, password, role, nickname) VALUES (?, ?, ?, ?)', [defaultEditorLogin, hashed, 'editor', defaultEditorLogin]);
  } else {
    const passOk = await bcrypt.compare(defaultEditorPassword, String(user.password));
    if (!passOk) {
      const hashed = await bcrypt.hash(defaultEditorPassword, 10);
      await query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    }
    if (String(user.role) !== 'editor') {
      await query("UPDATE users SET role = 'editor' WHERE id = ?", [user.id]);
    }
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { login, password, nickname, key } = req.body || {};

    const loginValue = String(login || '').trim();
    const passwordValue = String(password || '');
    const nicknameValue = String(nickname || '').trim();
    const keyValue = String(key || '').trim();

    if (!loginValue || !passwordValue || !nicknameValue || !keyValue) {
      return res.status(400).json({ error: 'Заполните логин, пароль, никнейм и ключ регистрации' });
    }

    if (passwordValue.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }

    const existingRows = await query('SELECT id FROM users WHERE login = ? LIMIT 1', [loginValue]);
    if (existingRows && existingRows[0]) {
      return res.status(409).json({ error: 'Пользователь с таким логином уже существует' });
    }

    const claim = await query(
      'UPDATE registration_keys SET is_active = 0, used_at = NOW() WHERE reg_key = ? AND is_active = 1 AND used_at IS NULL',
      [keyValue]
    );

    const affected = Number(claim?.affectedRows || 0);
    if (affected < 1) {
      return res.status(403).json({ error: 'Неверный или уже использованный ключ регистрации' });
    }

    const hashed = await bcrypt.hash(passwordValue, 10);
    const result = await query(
      'INSERT INTO users (login, password, role, nickname) VALUES (?, ?, ?, ?)',
      [loginValue, hashed, 'user', nicknameValue]
    );
    const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

    await safeQuery('UPDATE registration_keys SET used_by = ? WHERE reg_key = ? AND used_by IS NULL', [insertedId, keyValue]);

    res.status(201).json({
      id: insertedId,
      login: loginValue,
      nickname: nicknameValue,
      role: 'user',
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, login, nickname, role, created_at, updated_at FROM users ORDER BY created_at DESC',
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List users error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.delete('/api/admin/users/:id(\\d+)', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const currentUserId = Number(req.user?.userId);
    if (Number.isFinite(currentUserId) && id === currentUserId) {
      return res.status(403).json({ error: 'Нельзя удалить самого себя' });
    }

    const rows = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [id]);
    const user = rows && rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

app.patch('/api/admin/users/:id(\\d+)/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const roleValue = String(req.body?.role || '').trim().toLowerCase();
    if (roleValue !== 'user' && roleValue !== 'editor') {
      return res.status(400).json({ error: 'Роль должна быть user или editor' });
    }

    const rows = await query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [id]);
    const user = rows && rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await query('UPDATE users SET role = ? WHERE id = ?', [roleValue, id]);
    res.json({ id, role: roleValue });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении роли' });
  }
});

app.post('/api/admin/registration-keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const regKey = crypto.randomBytes(24).toString('base64url');
    const result = await query(
      'INSERT INTO registration_keys (reg_key, is_active, created_by) VALUES (?, 1, ?)',
      [regKey, req.user.userId]
    );

    const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
    res.status(201).json({ id: insertedId, key: regKey });
  } catch (error) {
    console.error('Create registration key error:', error);
    res.status(500).json({ error: 'Ошибка при создании ключа' });
  }
});

app.get('/api/admin/registration-keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      'SELECT rk.id, rk.reg_key AS `key`, rk.is_active, rk.created_at, rk.used_at, rk.used_by, u.login AS used_by_login, cu.login AS created_by_login FROM registration_keys rk LEFT JOIN users u ON rk.used_by = u.id LEFT JOIN users cu ON rk.created_by = cu.id ORDER BY rk.created_at DESC',
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List registration keys error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

const allowedSpellThemes = new Set([
  'none',
  'fire',
  'cold',
  'lightning',
  'acid',
  'poison',
  'necrotic',
  'radiant',
  'psychic',
  'force',
  'thunder',
]);

function normalizeSpellTheme(value) {
  if (value === undefined) return undefined;
  if (value === null) return 'none';
  const s = String(value).trim().toLowerCase();
  if (!s) return 'none';
  return allowedSpellThemes.has(s) ? s : 'none';
}

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1', []);
    res.json({ ok: true });
  } catch (error) {
    console.error('Healthcheck error:', error);
    res.status(503).json({ ok: false });
  }
});

const translitMap = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(input) {
  const raw = String(input || '').trim().toLowerCase();
  if (!raw) return '';

  const translit = raw
    .split('')
    .map((ch) => (translitMap[ch] !== undefined ? translitMap[ch] : ch))
    .join('');

  return translit
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureUniqueNewsSlug(base) {
  const baseSlug = base || `post-${Date.now()}`;
  let candidate = baseSlug;
  let i = 2;

  while (i < 200) {
    const rows = await query('SELECT id FROM news_posts WHERE slug = ? LIMIT 1', [candidate]);
    if (!rows || rows.length === 0) return candidate;
    candidate = `${baseSlug}-${i}`;
    i += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

app.get('/api/news', async (req, res) => {
  try {
    const rows = await query(
      "SELECT np.id, np.title, np.slug, np.excerpt, np.content, np.status, np.created_at, np.updated_at, u.login AS author_login, u.nickname AS author_nickname FROM news_posts np LEFT JOIN users u ON np.author_id = u.id WHERE np.status = 'published' ORDER BY np.created_at DESC",
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List news error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.get('/api/news/admin', authenticateToken, requireStaff, async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, title, slug, excerpt, content, status, created_at, updated_at FROM news_posts ORDER BY created_at DESC',
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List news admin error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.post('/api/news', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { title, content, excerpt, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Заполните заголовок и текст' });
    }

    const baseSlug = slugify(title) || `post-${Date.now()}`;
    const slug = await ensureUniqueNewsSlug(baseSlug);
    const finalStatus = status === 'draft' ? 'draft' : 'published';

    const result = await query(
      'INSERT INTO news_posts (title, slug, content, excerpt, author_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [String(title).trim(), slug, String(content), excerpt ? String(excerpt) : null, req.user.userId, finalStatus]
    );

    const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

    res.status(201).json({
      id: insertedId,
      title: String(title).trim(),
      slug,
      excerpt: excerpt ? String(excerpt) : null,
      content: String(content),
      status: finalStatus,
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Ошибка при создании новости' });
  }
});

app.put('/api/news/:id(\\d+)', authenticateToken, requireStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const rows = await query(
      'SELECT id, title, excerpt, content, status, slug FROM news_posts WHERE id = ? LIMIT 1',
      [id]
    );
    const existing = rows && rows[0];
    if (!existing) return res.status(404).json({ error: 'Новость не найдена' });

    const nextTitle = req.body.title !== undefined ? String(req.body.title).trim() : existing.title;
    const nextContent = req.body.content !== undefined ? String(req.body.content) : existing.content;
    const nextExcerpt =
      req.body.excerpt !== undefined
        ? req.body.excerpt
          ? String(req.body.excerpt).trim()
          : null
        : existing.excerpt;
    const nextStatus =
      req.body.status !== undefined ? (req.body.status === 'draft' ? 'draft' : 'published') : existing.status;

    if (!nextTitle) return res.status(400).json({ error: 'Заполните заголовок' });
    if (!nextContent || !String(nextContent).trim()) return res.status(400).json({ error: 'Заполните текст' });

    await query(
      'UPDATE news_posts SET title = ?, excerpt = ?, content = ?, status = ? WHERE id = ?',
      [nextTitle, nextExcerpt, nextContent, nextStatus, id]
    );

    res.json({
      id,
      slug: existing.slug,
      title: nextTitle,
      excerpt: nextExcerpt,
      content: nextContent,
      status: nextStatus,
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении новости' });
  }
});

app.delete('/api/news/:id(\\d+)', authenticateToken, requireStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    await query('DELETE FROM news_posts WHERE id = ?', [id]);
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Ошибка при удалении новости' });
  }
});

app.get('/api/spells', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, level, school, components, description, created_at, updated_at FROM spells ORDER BY name ASC',
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List spells error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.get('/api/spells/:id(\\d+)', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const rows = await query(
      'SELECT id, name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description, created_at, updated_at FROM spells WHERE id = ? LIMIT 1',
      [id]
    );

    const spell = rows && rows[0];
    if (!spell) return res.status(404).json({ error: 'Заклинание не найдено' });

    res.json(spell);
  } catch (error) {
    console.error('Get spell error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.get('/api/spells/:id(\\d+)/likes', authenticateOptional, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const countRows = await query('SELECT COUNT(*) AS c FROM spell_likes WHERE spell_id = ?', [id]);
    const count = Number(countRows?.[0]?.c || 0);

    let liked = false;
    if (req.user && req.user.userId) {
      const likedRows = await query('SELECT 1 AS ok FROM spell_likes WHERE spell_id = ? AND user_id = ? LIMIT 1', [id, req.user.userId]);
      liked = Boolean(likedRows && likedRows[0]);
    }

    res.json({ count, liked });
  } catch (error) {
    console.error('Get spell likes error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.get('/api/spells/:id(\\d+)/comments', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const rows = await query(
      'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM spell_comments c JOIN users u ON c.user_id = u.id WHERE c.spell_id = ? ORDER BY c.created_at ASC, c.id ASC',
      [id]
    );

    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('List spell comments error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.post('/api/spells/:id(\\d+)/comments', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const raw = String(req.body?.content || '');
    const content = raw.trim();
    if (!content) return res.status(400).json({ error: 'Комментарий не может быть пустым' });
    if (content.length > 2000) return res.status(400).json({ error: 'Комментарий слишком длинный (макс. 2000 символов)' });

    const exists = await query('SELECT id FROM spells WHERE id = ? LIMIT 1', [id]);
    if (!exists || !exists[0]) return res.status(404).json({ error: 'Заклинание не найдено' });

    const result = await query(
      'INSERT INTO spell_comments (spell_id, user_id, content) VALUES (?, ?, ?)',
      [id, req.user.userId, content]
    );
    const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

    const rows = await query(
      'SELECT c.id, c.content, c.created_at, u.login AS author_login, u.nickname AS author_nickname FROM spell_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1',
      [insertedId]
    );
    const created = rows && rows[0];
    res.status(201).json(created || { id: insertedId, content, created_at: new Date().toISOString() });
  } catch (error) {
    console.error('Create spell comment error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении комментария' });
  }
});

app.post('/api/spells/:id(\\d+)/like', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    await query('INSERT IGNORE INTO spell_likes (spell_id, user_id) VALUES (?, ?)', [id, req.user.userId]);
    const countRows = await query('SELECT COUNT(*) AS c FROM spell_likes WHERE spell_id = ?', [id]);
    const count = Number(countRows?.[0]?.c || 0);
    res.json({ count, liked: true });
  } catch (error) {
    console.error('Like spell error:', error);
    res.status(500).json({ error: 'Ошибка при лайке' });
  }
});

app.delete('/api/spells/:id(\\d+)/like', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    await query('DELETE FROM spell_likes WHERE spell_id = ? AND user_id = ?', [id, req.user.userId]);
    const countRows = await query('SELECT COUNT(*) AS c FROM spell_likes WHERE spell_id = ?', [id]);
    const count = Number(countRows?.[0]?.c || 0);
    res.json({ count, liked: false });
  } catch (error) {
    console.error('Unlike spell error:', error);
    res.status(500).json({ error: 'Ошибка при снятии лайка' });
  }
});

app.get('/api/spells/admin', authenticateToken, requireStaff, async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description, created_at, updated_at FROM spells ORDER BY name ASC',
      []
    );
    res.json(rows);
  } catch (error) {
    console.error('List spells admin error:', error);
    res.status(503).json({ error: 'База данных недоступна' });
  }
});

app.post('/api/spells', authenticateToken, requireStaff, async (req, res) => {
  try {
    const {
      name,
      name_en,
      level,
      school,
      theme,
      casting_time,
      range_text,
      components,
      duration,
      classes,
      subclasses,
      source,
      source_pages,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название заклинания обязательно' });
    }

    const lvl = Number(level);
    if (!Number.isFinite(lvl) || lvl < 0 || lvl > 9) {
      return res.status(400).json({ error: 'Уровень должен быть от 0 до 9' });
    }

    const themeValue = normalizeSpellTheme(theme) ?? 'none';

    const result = await query(
      'INSERT INTO spells (name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        String(name).trim(),
        name_en ? String(name_en).trim() : null,
        lvl,
        school ? String(school).trim() : null,
        themeValue,
        casting_time ? String(casting_time).trim() : null,
        range_text ? String(range_text).trim() : null,
        components ? String(components).trim() : null,
        duration ? String(duration).trim() : null,
        classes ? String(classes).trim() : null,
        subclasses ? String(subclasses).trim() : null,
        source ? String(source).trim() : null,
        source_pages ? String(source_pages).trim() : null,
        description ? String(description) : null,
      ]
    );

    const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

    res.status(201).json({
      id: insertedId,
      name: String(name).trim(),
      name_en: name_en ? String(name_en).trim() : null,
      level: lvl,
      school: school ? String(school).trim() : null,
      theme: themeValue,
      casting_time: casting_time ? String(casting_time).trim() : null,
      range_text: range_text ? String(range_text).trim() : null,
      components: components ? String(components).trim() : null,
      duration: duration ? String(duration).trim() : null,
      classes: classes ? String(classes).trim() : null,
      subclasses: subclasses ? String(subclasses).trim() : null,
      source: source ? String(source).trim() : null,
      source_pages: source_pages ? String(source_pages).trim() : null,
      description: description ? String(description) : null,
    });
  } catch (error) {
    console.error('Create spell error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении заклинания' });
  }
});

app.put('/api/spells/:id(\\d+)', authenticateToken, requireStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    const rows = await query(
      'SELECT id, name, name_en, level, school, theme, casting_time, range_text, components, duration, classes, subclasses, source, source_pages, description FROM spells WHERE id = ? LIMIT 1',
      [id]
    );
    const existing = rows && rows[0];
    if (!existing) return res.status(404).json({ error: 'Заклинание не найдено' });

    const normOpt = (v) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const s = String(v).trim();
      return s ? s : null;
    };

    const nextName = req.body.name !== undefined ? String(req.body.name).trim() : existing.name;
    if (!nextName) return res.status(400).json({ error: 'Название заклинания обязательно' });

    let nextLevel = existing.level;
    if (req.body.level !== undefined) {
      const lvl = Number(req.body.level);
      if (!Number.isFinite(lvl) || lvl < 0 || lvl > 9) {
        return res.status(400).json({ error: 'Уровень должен быть от 0 до 9' });
      }
      nextLevel = lvl;
    }

    const merged = {
      name: nextName,
      name_en: normOpt(req.body.name_en) === undefined ? existing.name_en : normOpt(req.body.name_en),
      level: nextLevel,
      school: normOpt(req.body.school) === undefined ? existing.school : normOpt(req.body.school),
      theme: normalizeSpellTheme(req.body.theme) === undefined ? (existing.theme || 'none') : normalizeSpellTheme(req.body.theme),
      casting_time: normOpt(req.body.casting_time) === undefined ? existing.casting_time : normOpt(req.body.casting_time),
      range_text: normOpt(req.body.range_text) === undefined ? existing.range_text : normOpt(req.body.range_text),
      components: normOpt(req.body.components) === undefined ? existing.components : normOpt(req.body.components),
      duration: normOpt(req.body.duration) === undefined ? existing.duration : normOpt(req.body.duration),
      classes: normOpt(req.body.classes) === undefined ? existing.classes : normOpt(req.body.classes),
      subclasses: normOpt(req.body.subclasses) === undefined ? existing.subclasses : normOpt(req.body.subclasses),
      source: normOpt(req.body.source) === undefined ? existing.source : normOpt(req.body.source),
      source_pages: normOpt(req.body.source_pages) === undefined ? existing.source_pages : normOpt(req.body.source_pages),
      description:
        req.body.description === undefined
          ? existing.description
          : req.body.description === null
            ? null
            : String(req.body.description),
    };

    await query(
      'UPDATE spells SET name = ?, name_en = ?, level = ?, school = ?, theme = ?, casting_time = ?, range_text = ?, components = ?, duration = ?, classes = ?, subclasses = ?, source = ?, source_pages = ?, description = ? WHERE id = ?',
      [
        merged.name,
        merged.name_en,
        merged.level,
        merged.school,
        merged.theme,
        merged.casting_time,
        merged.range_text,
        merged.components,
        merged.duration,
        merged.classes,
        merged.subclasses,
        merged.source,
        merged.source_pages,
        merged.description,
        id,
      ]
    );

    res.json({ id, ...merged });
  } catch (error) {
    console.error('Update spell error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении заклинания' });
  }
});

app.delete('/api/spells/:id(\\d+)', authenticateToken, requireStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Некорректный id' });

    await query('DELETE FROM spells WHERE id = ?', [id]);
    res.json({ message: 'Заклинание удалено' });
  } catch (error) {
    console.error('Delete spell error:', error);
    res.status(500).json({ error: 'Ошибка при удалении заклинания' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

async function start() {
  try {
    await ensureRuntimeSchema();
    console.log('✅ DB schema проверена/создана');
  } catch (error) {
    console.error('❌ DB schema init failed:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
}

start();
