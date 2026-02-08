import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import TraitsHeader from '../../components/admin/traits/TraitsHeader.jsx';
import TraitCreateForm from '../../components/admin/traits/TraitCreateForm.jsx';
import TraitRow from '../../components/admin/traits/TraitRow.jsx';
import { sourcesAPI, traitsAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();
const normalizeSourceKey = (v) => String(v || '').trim().toLowerCase();
const splitSourceTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

export default function AdminTraitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceItems, setSourceItems] = useState([]);

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [requirements, setRequirements] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [hasEotVariant, setHasEotVariant] = useState(false);
  const [descriptionEot, setDescriptionEot] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editRequirements, setEditRequirements] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHasEotVariant, setEditHasEotVariant] = useState(false);
  const [editDescriptionEot, setEditDescriptionEot] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, sourcesData] = await Promise.all([
        traitsAPI.listAdmin(),
        sourcesAPI.listAdmin(),
      ]);
      setItems(Array.isArray(data) ? data : []);
      setSourceItems(Array.isArray(sourcesData) ? sourcesData : []);
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
  const sourceOptions = useMemo(() => sourceItems, [sourceItems]);
  const sourceSet = useMemo(() => new Set(sourceItems.map((item) => normalizeSourceKey(item.name))), [sourceItems]);

  const invalidSourcesFor = (value) => {
    const tokens = splitSourceTokens(value);
    if (tokens.length === 0) return [];
    return tokens.filter((token) => !sourceSet.has(normalizeSourceKey(token)));
  };

  const sourceListId = 'admin-traits-sources';

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const invalidSources = invalidSourcesFor(source);
    if (invalidSources.length > 0) {
      setError(`Неизвестные источники: ${invalidSources.join(', ')}`);
      return;
    }

    const payload = {
      name: normalize(name),
      name_en: normalize(nameEn) || null,
      requirements: normalize(requirements) || null,
      source: normalize(source) || null,
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
      setRequirements('');
      setSource('');
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
    setEditRequirements(String(t.requirements || ''));
    setEditSource(String(t.source || ''));
    setEditDescription(String(t.description || ''));
    const eot = String(t.description_eot || '').trim();
    setEditHasEotVariant(Boolean(eot));
    setEditDescriptionEot(String(t.description_eot || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNameEn('');
    setEditRequirements('');
    setEditSource('');
    setEditDescription('');
    setEditHasEotVariant(false);
    setEditDescriptionEot('');
  };

  const saveEdit = async (id) => {
    setError('');

    const invalidSources = invalidSourcesFor(editSource);
    if (invalidSources.length > 0) {
      setError(`Неизвестные источники: ${invalidSources.join(', ')}`);
      return;
    }

    const payload = {
      name: normalize(editName),
      name_en: normalize(editNameEn) || null,
      requirements: normalize(editRequirements) || null,
      source: normalize(editSource) || null,
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
          requirements={requirements}
          onRequirementsChange={setRequirements}
          source={source}
          onSourceChange={setSource}
          sourceListId={sourceListId}
          sourceOptions={sourceOptions}
          description={description}
          onDescriptionChange={setDescription}
          hasEotVariant={hasEotVariant}
          onHasEotVariantChange={setHasEotVariant}
          descriptionEot={descriptionEot}
          onDescriptionEotChange={setDescriptionEot}
          onSubmit={handleCreate}
        />

        <datalist id={sourceListId}>
          {sourceOptions.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>

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
                    editRequirements,
                    setEditRequirements,
                    editSource,
                    setEditSource,
                    editDescription,
                    setEditDescription,
                    editHasEotVariant,
                    setEditHasEotVariant,
                    editDescriptionEot,
                    setEditDescriptionEot,
                  }}
                  sourceListId={sourceListId}
                  sourceOptions={sourceOptions}
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
