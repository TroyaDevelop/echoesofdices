import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT } from './config/env';
import { ensureRuntimeSchema } from './db/schema';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { startTradeLogCleanup } from './jobs/tradeLogCleanup';

import { authRouter } from './domains/auth/auth.routes';
import { usersRouter } from './domains/users/users.routes';
import { adminRouter } from './domains/admin/admin.routes';
import { newsRouter } from './domains/news/news.routes';
import { articlesRouter } from './domains/articles/articles.routes';
import { loreRouter } from './domains/lore/lore.routes';
import { marketRouter } from './domains/market/market.routes';
import { spellsRouter } from './domains/spells/spells.routes';
import { spellClassesRouter } from './domains/spellClasses/spellClasses.routes';
import { sourcesRouter } from './domains/sources/sources.routes';
import { traitsRouter } from './domains/traits/traits.routes';
import { wondrousRouter } from './domains/wondrous/wondrous.routes';
import { healthRouter } from './domains/health/health.routes';
import { botIntegrationRouter } from './domains/botIntegration/botIntegration.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/news', newsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/lore', loreRouter);
app.use('/api/market', marketRouter);
app.use('/api/spells', spellsRouter);
app.use('/api/spell-classes', spellClassesRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/traits', traitsRouter);
app.use('/api/wondrous-items', wondrousRouter);
app.use('/api/health', healthRouter);
app.use('/api/bot-integration', botIntegrationRouter);

app.use(errorHandler);
app.use(notFoundHandler);

async function start() {
  try {
    await ensureRuntimeSchema();
  } catch {
    return;
  }

  startTradeLogCleanup();

  app.listen(PORT, () => {
    return;
  });
}

start();
