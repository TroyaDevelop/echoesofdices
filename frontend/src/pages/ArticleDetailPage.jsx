import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PublicLayout from '../components/PublicLayout.jsx';
import { articlesAPI } from '../lib/api.js';
import SpellDescription from '../components/spells/SpellDescription.jsx';

const sourceBadge = (article) => {
  const source = String(article?.source || '').trim();
  const pages = String(article?.source_pages || '').trim();
  if (!source && !pages) return '';
  return [source, pages].filter(Boolean).join(' ');
};

export default function ArticleDetailPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await articlesAPI.getBySlug(slug);
      setArticle(data);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки статьи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const badge = useMemo(() => sourceBadge(article), [article]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <Link to="/articles" className="text-sm text-slate-300 hover:text-white transition-colors">
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
          <div className="text-slate-300">Статья не найдена.</div>
        ) : (
          <article className="parchment-card rounded-xl border border-black/10 text-slate-900 shadow-2xl overflow-hidden">
            <header className="px-4 sm:px-6 py-4 border-b border-black/10">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold">{article.title}</h1>
                {badge ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/70 border border-black/10 text-slate-800">
                    {badge}
                  </span>
                ) : null}
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
