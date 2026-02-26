import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import BackgroundsHeader from '../../components/admin/backgrounds/BackgroundsHeader.jsx';
import BackgroundCreateForm from '../../components/admin/backgrounds/BackgroundCreateForm.jsx';
import BackgroundRow from '../../components/admin/backgrounds/BackgroundRow.jsx';
import { backgroundsAPI, sourcesAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();
const normalizeSourceKey = (v) => String(v || '').trim().toLowerCase();
const splitSourceTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

export default function AdminBackgroundsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceItems, setSourceItems] = useState([]);

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [skillProficiencies, setSkillProficiencies] = useState('');
  const [toolProficiencies, setToolProficiencies] = useState('');
  const [equipment, setEquipment] = useState('');
  const [specialtyTitle, setSpecialtyTitle] = useState('');
  const [specialtyDice, setSpecialtyDice] = useState('к10');
  const [specialtyTable, setSpecialtyTable] = useState('');
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [personalization, setPersonalization] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSkillProficiencies, setEditSkillProficiencies] = useState('');
  const [editToolProficiencies, setEditToolProficiencies] = useState('');
  const [editEquipment, setEditEquipment] = useState('');
  const [editSpecialtyTitle, setEditSpecialtyTitle] = useState('');
  const [editSpecialtyDice, setEditSpecialtyDice] = useState('к10');
  const [editSpecialtyTable, setEditSpecialtyTable] = useState('');
  const [editFeatureTitle, setEditFeatureTitle] = useState('');
  const [editFeatureDescription, setEditFeatureDescription] = useState('');
  const [editPersonalization, setEditPersonalization] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, sourcesData] = await Promise.all([backgroundsAPI.listAdmin(), sourcesAPI.listAdmin()]);
      setItems(Array.isArray(data) ? data : []);
      setSourceItems(Array.isArray(sourcesData) ? sourcesData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки предысторий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const normalizedQuery = normalize(query).toLowerCase();
    const filtered = (items || []).filter((item) => {
      if (!normalizedQuery) return true;
      return normalize(item.name).toLowerCase().includes(normalizedQuery);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const shouldScroll = useMemo(() => filteredSorted.length > 8, [filteredSorted.length]);
  const sourceOptions = useMemo(() => sourceItems, [sourceItems]);
  const sourceSet = useMemo(() => new Set(sourceItems.map((item) => normalizeSourceKey(item.name))), [sourceItems]);

  const invalidSourcesFor = (value) => {
    const tokens = splitSourceTokens(value);
    if (tokens.length === 0) return [];
    return tokens.filter((token) => !sourceSet.has(normalizeSourceKey(token)));
  };

  const sourceListId = 'admin-backgrounds-sources';

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
      source: normalize(source) || null,
      description: normalizeSpellDescriptionForSave(description),
      skill_proficiencies: normalize(skillProficiencies) || null,
      tool_proficiencies: normalize(toolProficiencies) || null,
      equipment: normalize(equipment) || null,
      specialty_title: normalize(specialtyTitle) || null,
      specialty_dice: normalize(specialtyDice) || null,
      specialty_table: normalize(specialtyTable) || null,
      feature_title: normalize(featureTitle) || null,
      feature_description: normalize(featureDescription) || null,
      personalization: normalize(personalization) || null,
    };

    if (!payload.name) {
      setError('Название предыстории обязательно');
      return;
    }

    try {
      await backgroundsAPI.create(payload);
      setName('');
      setNameEn('');
      setSource('');
      setDescription('');
      setSkillProficiencies('');
      setToolProficiencies('');
      setEquipment('');
      setSpecialtyTitle('');
      setSpecialtyDice('к10');
      setSpecialtyTable('');
      setFeatureTitle('');
      setFeatureDescription('');
      setPersonalization('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления предыстории');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить предысторию?')) return;
    setError('');
    try {
      await backgroundsAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления предыстории');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(String(item.name || ''));
    setEditNameEn(String(item.name_en || ''));
    setEditSource(String(item.source || ''));
    setEditDescription(String(item.description || ''));
    setEditSkillProficiencies(String(item.skill_proficiencies || ''));
    setEditToolProficiencies(String(item.tool_proficiencies || ''));
    setEditEquipment(String(item.equipment || ''));
    setEditSpecialtyTitle(String(item.specialty_title || ''));
    setEditSpecialtyDice(String(item.specialty_dice || 'к10'));
    setEditSpecialtyTable(String(item.specialty_table || ''));
    setEditFeatureTitle(String(item.feature_title || ''));
    setEditFeatureDescription(String(item.feature_description || ''));
    setEditPersonalization(String(item.personalization || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNameEn('');
    setEditSource('');
    setEditDescription('');
    setEditSkillProficiencies('');
    setEditToolProficiencies('');
    setEditEquipment('');
    setEditSpecialtyTitle('');
    setEditSpecialtyDice('к10');
    setEditSpecialtyTable('');
    setEditFeatureTitle('');
    setEditFeatureDescription('');
    setEditPersonalization('');
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
      source: normalize(editSource) || null,
      description: normalizeSpellDescriptionForSave(editDescription),
      skill_proficiencies: normalize(editSkillProficiencies) || null,
      tool_proficiencies: normalize(editToolProficiencies) || null,
      equipment: normalize(editEquipment) || null,
      specialty_title: normalize(editSpecialtyTitle) || null,
      specialty_dice: normalize(editSpecialtyDice) || null,
      specialty_table: normalize(editSpecialtyTable) || null,
      feature_title: normalize(editFeatureTitle) || null,
      feature_description: normalize(editFeatureDescription) || null,
      personalization: normalize(editPersonalization) || null,
    };

    if (!payload.name) {
      setError('Название предыстории обязательно');
      return;
    }

    try {
      await backgroundsAPI.update(id, payload);
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления предыстории');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <BackgroundsHeader query={query} onQueryChange={setQuery} />

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <BackgroundCreateForm
          name={name}
          onNameChange={setName}
          nameEn={nameEn}
          onNameEnChange={setNameEn}
          source={source}
          onSourceChange={setSource}
          sourceListId={sourceListId}
          sourceOptions={sourceOptions}
          description={description}
          onDescriptionChange={setDescription}
          skillProficiencies={skillProficiencies}
          onSkillProficienciesChange={setSkillProficiencies}
          toolProficiencies={toolProficiencies}
          onToolProficienciesChange={setToolProficiencies}
          equipment={equipment}
          onEquipmentChange={setEquipment}
          specialtyTitle={specialtyTitle}
          onSpecialtyTitleChange={setSpecialtyTitle}
          specialtyDice={specialtyDice}
          onSpecialtyDiceChange={setSpecialtyDice}
          specialtyTable={specialtyTable}
          onSpecialtyTableChange={setSpecialtyTable}
          featureTitle={featureTitle}
          onFeatureTitleChange={setFeatureTitle}
          featureDescription={featureDescription}
          onFeatureDescriptionChange={setFeatureDescription}
          personalization={personalization}
          onPersonalizationChange={setPersonalization}
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
            <div className="p-6 text-gray-700">Предысторий не найдено.</div>
          ) : (
            <div className={`divide-y divide-gray-200 ${shouldScroll ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
              {filteredSorted.map((item) => (
                <BackgroundRow
                  key={item.id}
                  background={item}
                  isEditing={editingId === item.id}
                  onStartEdit={() => startEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  editState={{
                    editingKey: editingId,
                    editName,
                    setEditName,
                    editNameEn,
                    setEditNameEn,
                    editSource,
                    setEditSource,
                    editDescription,
                    setEditDescription,
                    editSkillProficiencies,
                    setEditSkillProficiencies,
                    editToolProficiencies,
                    setEditToolProficiencies,
                    editEquipment,
                    setEditEquipment,
                    editSpecialtyTitle,
                    setEditSpecialtyTitle,
                    editSpecialtyDice,
                    setEditSpecialtyDice,
                    editSpecialtyTable,
                    setEditSpecialtyTable,
                    editFeatureTitle,
                    setEditFeatureTitle,
                    editFeatureDescription,
                    setEditFeatureDescription,
                    editPersonalization,
                    setEditPersonalization,
                  }}
                  sourceListId={sourceListId}
                  sourceOptions={sourceOptions}
                  onSaveEdit={() => saveEdit(item.id)}
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
