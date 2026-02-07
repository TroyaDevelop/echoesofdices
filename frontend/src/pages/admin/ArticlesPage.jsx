import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ArticleCreateForm from '../../components/admin/articles/ArticleCreateForm.jsx';
import ArticleHeader from '../../components/admin/articles/ArticleHeader.jsx';
import ArticleList from '../../components/admin/articles/ArticleList.jsx';
import { articlesAPI } from '../../lib/api.js';
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

export default function AdminArticlesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('published');
  const [editSource, setEditSource] = useState('');
  const [editSourcePages, setEditSourcePages] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [source, setSource] = useState('');
  const [sourcePages, setSourcePages] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await articlesAPI.listAdmin();
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

  const shouldScrollArticles = useMemo(() => items.length > 4, [items.length]);

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
      await articlesAPI.create({
        title: t,
        excerpt: excerpt.trim() || null,
        content: c,
        status,
        source: source.trim() || null,
        source_pages: sourcePages.trim() || null,
      });
      setTitle('');
      setExcerpt('');
      setContent('');
      setStatus('published');
      setSource('');
      setSourcePages('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка создания статьи');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить статью?')) return;
    setError('');
    try {
      await articlesAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления статьи');
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditTitle(String(post.title || ''));
    setEditExcerpt(String(post.excerpt || ''));
    setEditContent(String(post.content || ''));
    setEditStatus(post.status === 'draft' ? 'draft' : 'published');
    setEditSource(String(post.source || ''));
    setEditSourcePages(String(post.source_pages || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditExcerpt('');
    setEditContent('');
    setEditStatus('published');
    setEditSource('');
    setEditSourcePages('');
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
      await articlesAPI.update(id, {
        title: t,
        excerpt: editExcerpt.trim() || null,
        content: c,
        status: editStatus,
        source: editSource.trim() || null,
        source_pages: editSourcePages.trim() || null,
      });
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления статьи');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <ArticleHeader />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <ArticleCreateForm
          title={title}
          onTitleChange={(e) => setTitle(e.target.value)}
          excerpt={excerpt}
          onExcerptChange={(e) => setExcerpt(e.target.value)}
          content={content}
          onContentChange={setContent}
          status={status}
          onStatusChange={(e) => setStatus(e.target.value)}
          source={source}
          onSourceChange={(e) => setSource(e.target.value)}
          sourcePages={sourcePages}
          onSourcePagesChange={(e) => setSourcePages(e.target.value)}
          onSubmit={handleCreate}
        />

        <ArticleList
          loading={loading}
          items={items}
          shouldScroll={shouldScrollArticles}
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
          editSource={editSource}
          onEditSourceChange={(e) => setEditSource(e.target.value)}
          editSourcePages={editSourcePages}
          onEditSourcePagesChange={(e) => setEditSourcePages(e.target.value)}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      </div>
    </AdminLayout>
  );
}
