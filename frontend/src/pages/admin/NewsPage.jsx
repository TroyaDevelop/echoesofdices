import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { newsAPI } from '../../lib/api.js';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value || '');
  }
};

export default function AdminNewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('published');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await newsAPI.listAdmin();
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const t = title.trim();
    const c = content.trim();

    if (!t || !c) {
      setError('Заполните заголовок и текст');
      return;
    }

    try {
      await newsAPI.create({
        title: t,
        excerpt: excerpt.trim() || null,
        content: c,
        status,
      });
      setTitle('');
      setExcerpt('');
      setContent('');
      setStatus('published');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка создания новости');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить новость?')) return;
    setError('');
    try {
      await newsAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления новости');
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditTitle(String(post.title || ''));
    setEditExcerpt(String(post.excerpt || ''));
    setEditContent(String(post.content || ''));
    setEditStatus(post.status === 'draft' ? 'draft' : 'published');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditExcerpt('');
    setEditContent('');
    setEditStatus('published');
  };

  const saveEdit = async (id) => {
    setError('');
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t || !c) {
      setError('Заполните заголовок и текст');
      return;
    }

    try {
      await newsAPI.update(id, {
        title: t,
        excerpt: editExcerpt.trim() || null,
        content: c,
        status: editStatus,
      });
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления новости');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Новости</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-lg font-semibold text-gray-900">Добавить новость</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="published">Опубликовано</option>
                <option value="draft">Черновик</option>
              </select>
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Короткое описание (опционально)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Текст"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
              Создать
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-gray-700">Новостей пока нет.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((post) => (
                <div key={post.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="font-semibold text-gray-900 truncate">{post.title}</div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status === 'published' ? 'Опубликовано' : 'Черновик'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                    </div>

                    {post.excerpt && <div className="text-sm text-gray-600 mt-1">{post.excerpt}</div>}

                    {editingId === post.id ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-sm font-semibold text-gray-900">Редактирование</div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Статус</label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="published">Опубликовано</option>
                              <option value="draft">Черновик</option>
                            </select>
                          </div>
                        </div>

                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Заголовок"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <input
                          value={editExcerpt}
                          onChange={(e) => setEditExcerpt(e.target.value)}
                          placeholder="Короткое описание (опционально)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Текст"
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => saveEdit(post.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {editingId === post.id ? null : (
                      <button
                        onClick={() => startEdit(post)}
                        className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                      >
                        Редактировать
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
