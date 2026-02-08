import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import LoreCreateForm from '../../components/admin/lore/LoreCreateForm.jsx';
import LoreHeader from '../../components/admin/lore/LoreHeader.jsx';
import LoreList from '../../components/admin/lore/LoreList.jsx';
import { loreAPI } from '../../lib/api.js';
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

const parseYear = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
};

export default function AdminLorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editLocations, setEditLocations] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('published');

  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [locationsValue, setLocationsValue] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await loreAPI.listAdmin();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки лора');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await loreAPI.listLocationsAdmin();
      setLocations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    loadLocations();
  }, []);

  const shouldScroll = useMemo(() => items.length > 4, [items.length]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const t = title.trim();
    const c = normalizeSpellDescriptionForSave(content);
    const y = parseYear(year);

    if (!t || !c) {
      setError('Заполните заголовок и текст');
      return;
    }

    if (y === null) {
      setError('Укажите год события');
      return;
    }

    try {
      await loreAPI.create({
        title: t,
        year: y,
        locations: locationsValue.trim() || null,
        excerpt: excerpt.trim() || null,
        content: c,
        status,
      });
      setTitle('');
      setYear('');
      setLocationsValue('');
      setExcerpt('');
      setContent('');
      setStatus('published');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка создания записи');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить запись?')) return;
    setError('');
    try {
      await loreAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления записи');
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditTitle(String(post.title || ''));
    setEditYear(String(post.year ?? ''));
    setEditLocations(String(post.locations || ''));
    setEditExcerpt(String(post.excerpt || ''));
    setEditContent(String(post.content || ''));
    setEditStatus(post.status === 'draft' ? 'draft' : 'published');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditYear('');
    setEditLocations('');
    setEditExcerpt('');
    setEditContent('');
    setEditStatus('published');
  };

  const saveEdit = async (id) => {
    setError('');
    const t = editTitle.trim();
    const c = normalizeSpellDescriptionForSave(editContent);
    const y = parseYear(editYear);
    if (!t || !c) {
      setError('Заполните заголовок и текст');
      return;
    }
    if (y === null) {
      setError('Укажите год события');
      return;
    }

    try {
      await loreAPI.update(id, {
        title: t,
        year: y,
        locations: editLocations.trim() || null,
        excerpt: editExcerpt.trim() || null,
        content: c,
        status: editStatus,
      });
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления записи');
    }
  };

  const locationDatalistId = 'lore-location-options';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <LoreHeader />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <datalist id={locationDatalistId}>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.name} />
          ))}
        </datalist>

        <LoreCreateForm
          title={title}
          onTitleChange={(e) => setTitle(e.target.value)}
          year={year}
          onYearChange={(e) => setYear(e.target.value)}
          locations={locationsValue}
          onLocationsChange={(e) => setLocationsValue(e.target.value)}
          locationDatalistId={locationDatalistId}
          locationOptions={locations}
          excerpt={excerpt}
          onExcerptChange={(e) => setExcerpt(e.target.value)}
          content={content}
          onContentChange={setContent}
          status={status}
          onStatusChange={(e) => setStatus(e.target.value)}
          onSubmit={handleCreate}
        />

        <LoreList
          loading={loading}
          items={items}
          shouldScroll={shouldScroll}
          editingId={editingId}
          formatDate={formatDate}
          onStartEdit={startEdit}
          onDelete={handleDelete}
          editTitle={editTitle}
          onEditTitleChange={(e) => setEditTitle(e.target.value)}
          editYear={editYear}
          onEditYearChange={(e) => setEditYear(e.target.value)}
          editLocations={editLocations}
          onEditLocationsChange={(e) => setEditLocations(e.target.value)}
          locationDatalistId={locationDatalistId}
          locationOptions={locations}
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
