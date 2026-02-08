import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PublicLayout from '../components/PublicLayout.jsx';
import { loreAPI } from '../lib/api.js';
import SpellDescription from '../components/spells/SpellDescription.jsx';

const parseLocations = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

export default function LoreDetailPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await loreAPI.getBySlug(slug);
      setArticle(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки записи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const yearValue = Number.isFinite(Number(article?.year)) ? Math.trunc(Number(article?.year)) : null;
  const locations = useMemo(() => parseLocations(article?.locations), [article]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <Link to="/lore" className="text-sm text-slate-300 hover:text-white transition-colors">
          ← К списку
        </Link>

        {error && (
          <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : !article ? (
          <div className="text-slate-300">Запись не найдена.</div>
        ) : (
          <article className="parchment-card rounded-xl border border-black/10 text-slate-900 shadow-2xl overflow-hidden">
            <header className="px-4 sm:px-6 py-4 border-b border-black/10">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-semibold">{article.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {yearValue !== null ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/70 border border-black/10 text-slate-800">
                        {yearValue}
                      </span>
                    ) : null}
                    {locations.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/70 border border-black/10 text-slate-800">
                        {locations.join(', ')}
                      </span>
                    ) : null}
                  </div>
              </div>
            </header>

            <div className="px-4 sm:px-6 py-4">
              <SpellDescription description={article.content} />
            </div>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}
