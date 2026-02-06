import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import NewsCreateForm from '../../components/admin/news/NewsCreateForm.jsx';
import NewsHeader from '../../components/admin/news/NewsHeader.jsx';
import NewsList from '../../components/admin/news/NewsList.jsx';
import { newsAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

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

  const shouldScrollNews = useMemo(() => items.length > 4, [items.length]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const t = title.trim();
    const c = normalizeSpellDescriptionForSave(content);

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
    const c = normalizeSpellDescriptionForSave(editContent);
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
        <NewsHeader />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <NewsCreateForm
          title={title}
          onTitleChange={(e) => setTitle(e.target.value)}
          excerpt={excerpt}
          onExcerptChange={(e) => setExcerpt(e.target.value)}
          content={content}
          onContentChange={setContent}
          status={status}
          onStatusChange={(e) => setStatus(e.target.value)}
          onSubmit={handleCreate}
        />

        <NewsList
          loading={loading}
          items={items}
          shouldScroll={shouldScrollNews}
          editingId={editingId}
          formatDate={formatDate}
          onStartEdit={startEdit}
          onDelete={handleDelete}
          editTitle={editTitle}
          onEditTitleChange={(e) => setEditTitle(e.target.value)}
          editExcerpt={editExcerpt}
          onEditExcerptChange={(e) => setEditExcerpt(e.target.value)}
          editContent={editContent}
          onEditContentChange={setEditContent}
          editStatus={editStatus}
          onEditStatusChange={(e) => setEditStatus(e.target.value)}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      </div>
    </AdminLayout>
  );
}
