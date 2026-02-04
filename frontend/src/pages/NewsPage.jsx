import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { newsAPI } from '../lib/api.js';
import { isRichHtmlDescription, sanitizeSpellDescriptionHtml } from '../lib/richText.js';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value || '');
  }
};

const authorLine = (post) => {
  const nickname = String(post?.author_nickname || '').trim();
  const login = String(post?.author_login || '').trim();
  const name = nickname || login;
  return name ? `Автор: ${name}` : '';
};

export default function NewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await newsAPI.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PublicLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Новости</h1>
          <p className="mt-2 text-slate-300">Обновления проекта и заметки.</p>
        </div>

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="text-slate-300">Пока нет новостей.</div>
        ) : (
          <div className="space-y-6">
            {items.map((post) => (
              <article
                key={post.id || post.slug}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <header className="space-y-1">
                  <h2 className="text-2xl font-semibold">{post.title}</h2>
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{formatDate(post.created_at)}</span>
                    {authorLine(post) ? <span>{authorLine(post)}</span> : null}
                  </div>
                </header>

                {post.excerpt ? (
                  <>
                    <div className="mt-4 text-slate-200 whitespace-pre-wrap leading-relaxed">{post.excerpt}</div>

                    {isRichHtmlDescription(post.content) ? (
                      <div
                        className="news-content mt-4 text-slate-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeSpellDescriptionHtml(post.content) }}
                      />
                    ) : (
                      <div className="mt-4 text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</div>
                    )}
                  </>
                ) : isRichHtmlDescription(post.content) ? (
                  <div
                    className="news-content mt-4 text-slate-100 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeSpellDescriptionHtml(post.content) }}
                  />
                ) : (
                  <div className="mt-4 text-slate-100 whitespace-pre-wrap leading-relaxed">{post.content}</div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
