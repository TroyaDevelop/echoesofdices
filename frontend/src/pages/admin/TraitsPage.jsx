import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import TraitsHeader from '../../components/admin/traits/TraitsHeader.jsx';
import TraitCreateForm from '../../components/admin/traits/TraitCreateForm.jsx';
import TraitRow from '../../components/admin/traits/TraitRow.jsx';
import { traitsAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();

export default function AdminTraitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [source, setSource] = useState('');
  const [sourcePages, setSourcePages] = useState('');
  const [description, setDescription] = useState('');
  const [hasEotVariant, setHasEotVariant] = useState(false);
  const [descriptionEot, setDescriptionEot] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editSourcePages, setEditSourcePages] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHasEotVariant, setEditHasEotVariant] = useState(false);
  const [editDescriptionEot, setEditDescriptionEot] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await traitsAPI.listAdmin();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки черт');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();
    const filtered = (items || []).filter((t) => {
      if (!q) return true;
      return normalize(t.name).toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const shouldScrollTraits = useMemo(() => filteredSorted.length > 8, [filteredSorted.length]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: normalize(name),
      name_en: normalize(nameEn) || null,
      source: normalize(source) || null,
      source_pages: normalize(sourcePages) || null,
      description: normalizeSpellDescriptionForSave(description),
      description_eot: hasEotVariant ? normalizeSpellDescriptionForSave(descriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название черты обязательно');
      return;
    }

    try {
      await traitsAPI.create(payload);
      setName('');
      setNameEn('');
      setSource('');
      setSourcePages('');
      setDescription('');
      setHasEotVariant(false);
      setDescriptionEot('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления черты');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить черту?')) return;
    setError('');
    try {
      await traitsAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления черты');
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditName(String(t.name || ''));
    setEditNameEn(String(t.name_en || ''));
    setEditSource(String(t.source || ''));
    setEditSourcePages(String(t.source_pages || ''));
    setEditDescription(String(t.description || ''));
    const eot = String(t.description_eot || '').trim();
    setEditHasEotVariant(Boolean(eot));
    setEditDescriptionEot(String(t.description_eot || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNameEn('');
    setEditSource('');
    setEditSourcePages('');
    setEditDescription('');
    setEditHasEotVariant(false);
    setEditDescriptionEot('');
  };

  const saveEdit = async (id) => {
    setError('');

    const payload = {
      name: normalize(editName),
      name_en: normalize(editNameEn) || null,
      source: normalize(editSource) || null,
      source_pages: normalize(editSourcePages) || null,
      description: normalizeSpellDescriptionForSave(editDescription),
      description_eot: editHasEotVariant ? normalizeSpellDescriptionForSave(editDescriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название черты обязательно');
      return;
    }

    try {
      await traitsAPI.update(id, payload);
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления черты');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <TraitsHeader query={query} onQueryChange={setQuery} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <TraitCreateForm
          name={name}
          onNameChange={setName}
          nameEn={nameEn}
          onNameEnChange={setNameEn}
          source={source}
          onSourceChange={setSource}
          sourcePages={sourcePages}
          onSourcePagesChange={setSourcePages}
          description={description}
          onDescriptionChange={setDescription}
          hasEotVariant={hasEotVariant}
          onHasEotVariantChange={setHasEotVariant}
          descriptionEot={descriptionEot}
          onDescriptionEotChange={setDescriptionEot}
          onSubmit={handleCreate}
        />

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 text-gray-700">Черт не найдено.</div>
          ) : (
            <div className={`divide-y divide-gray-200 ${shouldScrollTraits ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
              {filteredSorted.map((t) => (
                <TraitRow
                  key={t.id}
                  trait={t}
                  isEditing={editingId === t.id}
                  onStartEdit={() => startEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                  editState={{
                    editingKey: editingId,
                    editName,
                    setEditName,
                    editNameEn,
                    setEditNameEn,
                    editSource,
                    setEditSource,
                    editSourcePages,
                    setEditSourcePages,
                    editDescription,
                    setEditDescription,
                    editHasEotVariant,
                    setEditHasEotVariant,
                    editDescriptionEot,
                    setEditDescriptionEot,
                  }}
                  onSaveEdit={() => saveEdit(t.id)}
                  onCancelEdit={cancelEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
