import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PublicLayout from '../components/PublicLayout.jsx';
import { articlesAPI } from '../lib/api.js';
import { isRichHtmlDescription } from '../lib/richText.js';

const stripHtml = (value) => {
  return String(value || '')
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
};

const buildPreview = (article) => {
  if (!article) return '';
  const excerpt = String(article.excerpt || '').trim();
  if (excerpt) return excerpt;
  const content = String(article.content || '').trim();
  if (!content) return '';
  const raw = isRichHtmlDescription(content) ? stripHtml(content) : content;
  if (!raw) return '';
  return raw.length > 320 ? `${raw.slice(0, 320).trim()}…` : raw;
};

export default function ArticlesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await articlesAPI.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки статей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(() => {
    return (items || []).map((article) => ({
      ...article,
      preview: buildPreview(article),
    }));
  }, [items]);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Статьи</h1>
          <p className="mt-2 text-slate-300">Материалы, заметки и полезные справки.</p>
        </div>

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : cards.length === 0 ? (
          <div className="text-slate-300">Пока нет статей.</div>
        ) : (
          <div className="space-y-4">
            {cards.map((article) => (
              <article
                key={article.id || article.slug}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-100 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-xl font-semibold">{article.title}</h2>
                {article.preview ? (
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{article.preview}</p>
                ) : null}
                <div className="mt-3">
                  <Link
                    to={`/articles/${article.slug}`}
                    className="text-sm font-semibold text-purple-200 underline hover:text-purple-100"
                  >
                    Читать далее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
