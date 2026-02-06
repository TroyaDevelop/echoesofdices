import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import SpellClassesPanel from '../../components/admin/spells/SpellClassesPanel.jsx';
import SpellCreateForm from '../../components/admin/spells/SpellCreateForm.jsx';
import SpellRow from '../../components/admin/spells/SpellRow.jsx';
import SpellsHeader from '../../components/admin/spells/SpellsHeader.jsx';
import { spellClassesAPI, spellsAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();
const normalizeClassKey = (v) => String(v || '').trim().toLowerCase();
const splitClassTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const themeOptions = [
  { value: 'none', label: 'Без стихии' },
  { value: 'fire', label: 'Огонь' },
  { value: 'cold', label: 'Холод' },
  { value: 'lightning', label: 'Молния' },
  { value: 'acid', label: 'Кислота' },
  { value: 'poison', label: 'Яд' },
  { value: 'necrotic', label: 'Некротический' },
  { value: 'radiant', label: 'Излучение' },
  { value: 'psychic', label: 'Психический' },
  { value: 'force', label: 'Силовое поле' },
  { value: 'thunder', label: 'Гром' },
];

const normalizeTheme = (v) => {
  const s = String(v ?? 'none').trim().toLowerCase();
  return themeOptions.some((o) => o.value === s) ? s : 'none';
};

export default function AdminSpellsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classItems, setClassItems] = useState([]);
  const [classDraft, setClassDraft] = useState('');
  const [classBusy, setClassBusy] = useState(false);

  const [query, setQuery] = useState('');

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [level, setLevel] = useState(0);
  const [school, setSchool] = useState('');
  const [theme, setTheme] = useState('none');
  const [castingTime, setCastingTime] = useState('');
  const [rangeText, setRangeText] = useState('');
  const [components, setComponents] = useState('');
  const [duration, setDuration] = useState('');
  const [classes, setClasses] = useState('');
  const [subclasses, setSubclasses] = useState('');
  const [source, setSource] = useState('');
  const [sourcePages, setSourcePages] = useState('');
  const [description, setDescription] = useState('');
  const [hasEotVariant, setHasEotVariant] = useState(false);
  const [descriptionEot, setDescriptionEot] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editLevel, setEditLevel] = useState(0);
  const [editSchool, setEditSchool] = useState('');
  const [editTheme, setEditTheme] = useState('none');
  const [editCastingTime, setEditCastingTime] = useState('');
  const [editRangeText, setEditRangeText] = useState('');
  const [editComponents, setEditComponents] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editClasses, setEditClasses] = useState('');
  const [editSubclasses, setEditSubclasses] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editSourcePages, setEditSourcePages] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHasEotVariant, setEditHasEotVariant] = useState(false);
  const [editDescriptionEot, setEditDescriptionEot] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [data, classesData] = await Promise.all([spellsAPI.listAdmin(), spellClassesAPI.listAdmin()]);
      setItems(Array.isArray(data) ? data : []);
      setClassItems(Array.isArray(classesData) ? classesData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки заклинаний');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();
    const filtered = (items || []).filter((s) => {
      if (!q) return true;
      return normalize(s.name).toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const shouldScrollSpells = useMemo(() => filteredSorted.length > 8, [filteredSorted.length]);

  const classOptions = useMemo(() => classItems, [classItems]);
  const classSet = useMemo(() => new Set(classItems.map((item) => normalizeClassKey(item.name))), [classItems]);

  const invalidClassesFor = (value) => {
    const tokens = splitClassTokens(value);
    if (tokens.length === 0) return [];
    return tokens.filter((token) => !classSet.has(normalizeClassKey(token)));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setError('');
    const value = normalize(classDraft);
    if (!value) {
      setError('Название класса обязательно');
      return;
    }

    try {
      setClassBusy(true);
      await spellClassesAPI.create(value);
      setClassDraft('');
      const next = await spellClassesAPI.listAdmin();
      setClassItems(Array.isArray(next) ? next : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка добавления класса');
    } finally {
      setClassBusy(false);
    }
  };

  const handleRemoveClass = async (id) => {
    setError('');
    try {
      await spellClassesAPI.remove(id);
      setClassItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления класса');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const invalidClasses = invalidClassesFor(classes);
    if (invalidClasses.length > 0) {
      setError(`Неизвестные классы: ${invalidClasses.join(', ')}`);
      return;
    }

    const payload = {
      name: normalize(name),
      name_en: normalize(nameEn) || null,
      level: Number(level),
      school: normalize(school) || null,
      theme: normalizeTheme(theme),
      casting_time: normalize(castingTime) || null,
      range_text: normalize(rangeText) || null,
      components: normalize(components) || null,
      duration: normalize(duration) || null,
      classes: normalize(classes) || null,
      subclasses: normalize(subclasses) || null,
      source: normalize(source) || null,
      source_pages: normalize(sourcePages) || null,
      description: normalizeSpellDescriptionForSave(description),
      description_eot: hasEotVariant ? normalizeSpellDescriptionForSave(descriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название заклинания обязательно');
      return;
    }

    if (!Number.isFinite(payload.level) || payload.level < 0 || payload.level > 9) {
      setError('Уровень должен быть от 0 до 9');
      return;
    }

    try {
      await spellsAPI.create(payload);
      setName('');
      setNameEn('');
      setLevel(0);
      setSchool('');
      setTheme('none');
      setCastingTime('');
      setRangeText('');
      setComponents('');
      setDuration('');
      setClasses('');
      setSubclasses('');
      setSource('');
      setSourcePages('');
      setDescription('');
      setHasEotVariant(false);
      setDescriptionEot('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления заклинания');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить заклинание?')) return;
    setError('');
    try {
      await spellsAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления заклинания');
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(String(s.name || ''));
    setEditNameEn(String(s.name_en || ''));
    setEditLevel(Number.isFinite(Number(s.level)) ? Number(s.level) : 0);
    setEditSchool(String(s.school || ''));
    setEditTheme(normalizeTheme(s.theme || 'none'));
    setEditCastingTime(String(s.casting_time || ''));
    setEditRangeText(String(s.range_text || ''));
    setEditComponents(String(s.components || ''));
    setEditDuration(String(s.duration || ''));
    setEditClasses(String(s.classes || ''));
    setEditSubclasses(String(s.subclasses || ''));
    setEditSource(String(s.source || ''));
    setEditSourcePages(String(s.source_pages || ''));
    setEditDescription(String(s.description || ''));
    const eot = String(s.description_eot || '').trim();
    setEditHasEotVariant(Boolean(eot));
    setEditDescriptionEot(String(s.description_eot || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNameEn('');
    setEditLevel(0);
    setEditSchool('');
    setEditTheme('none');
    setEditCastingTime('');
    setEditRangeText('');
    setEditComponents('');
    setEditDuration('');
    setEditClasses('');
    setEditSubclasses('');
    setEditSource('');
    setEditSourcePages('');
    setEditDescription('');
    setEditHasEotVariant(false);
    setEditDescriptionEot('');
  };

  const saveEdit = async (id) => {
    setError('');

    const invalidClasses = invalidClassesFor(editClasses);
    if (invalidClasses.length > 0) {
      setError(`Неизвестные классы: ${invalidClasses.join(', ')}`);
      return;
    }
    const payload = {
      name: normalize(editName),
      name_en: normalize(editNameEn) || null,
      level: Number(editLevel),
      school: normalize(editSchool) || null,
      theme: normalizeTheme(editTheme),
      casting_time: normalize(editCastingTime) || null,
      range_text: normalize(editRangeText) || null,
      components: normalize(editComponents) || null,
      duration: normalize(editDuration) || null,
      classes: normalize(editClasses) || null,
      subclasses: normalize(editSubclasses) || null,
      source: normalize(editSource) || null,
      source_pages: normalize(editSourcePages) || null,
      description: normalizeSpellDescriptionForSave(editDescription),
      description_eot: editHasEotVariant ? normalizeSpellDescriptionForSave(editDescriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название заклинания обязательно');
      return;
    }
    if (!Number.isFinite(payload.level) || payload.level < 0 || payload.level > 9) {
      setError('Уровень должен быть от 0 до 9');
      return;
    }

    try {
      await spellsAPI.update(id, payload);
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления заклинания');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <SpellsHeader query={query} onQueryChange={setQuery} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <SpellCreateForm
          name={name}
          onNameChange={setName}
          nameEn={nameEn}
          onNameEnChange={setNameEn}
          level={level}
          onLevelChange={setLevel}
          school={school}
          onSchoolChange={setSchool}
          theme={theme}
          onThemeChange={setTheme}
          castingTime={castingTime}
          onCastingTimeChange={setCastingTime}
          rangeText={rangeText}
          onRangeTextChange={setRangeText}
          components={components}
          onComponentsChange={setComponents}
          duration={duration}
          onDurationChange={setDuration}
          classes={classes}
          onClassesChange={setClasses}
          subclasses={subclasses}
          onSubclassesChange={setSubclasses}
          classOptions={classOptions}
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
          themeOptions={themeOptions}
          onSubmit={handleCreate}
        />

        <SpellClassesPanel
          value={classDraft}
          onValueChange={setClassDraft}
          onAdd={handleAddClass}
          items={classItems}
          onRemove={handleRemoveClass}
          busy={classBusy}
        />

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 text-gray-700">Заклинаний не найдено.</div>
          ) : (
            <div className={`divide-y divide-gray-200 ${shouldScrollSpells ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
              {filteredSorted.map((s) => (
                <SpellRow
                  key={s.id}
                  spell={s}
                  isEditing={editingId === s.id}
                  onStartEdit={() => startEdit(s)}
                  onDelete={() => handleDelete(s.id)}
                  editState={{
                    editingKey: editingId,
                    editName,
                    setEditName,
                    editNameEn,
                    setEditNameEn,
                    editLevel,
                    setEditLevel,
                    editSchool,
                    setEditSchool,
                    editTheme,
                    setEditTheme,
                    editCastingTime,
                    setEditCastingTime,
                    editRangeText,
                    setEditRangeText,
                    editComponents,
                    setEditComponents,
                    editDuration,
                    setEditDuration,
                    editClasses,
                    setEditClasses,
                    editSubclasses,
                    setEditSubclasses,
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
                  classOptions={classOptions}
                  themeOptions={themeOptions}
                  onSaveEdit={() => saveEdit(s.id)}
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
