import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { spellsAPI } from '../../lib/api.js';

const normalize = (v) => String(v || '').trim();

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

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await spellsAPI.listAdmin();
      setItems(Array.isArray(data) ? data : []);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

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
      description: normalize(description) || null,
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
  };

  const saveEdit = async (id) => {
    setError('');
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
      description: normalize(editDescription) || null,
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Заклинания</h1>
          <div className="w-full sm:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div className="text-lg font-semibold text-gray-900">Добавить заклинание</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Название (EN) (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Уровень</label>
              <input
                type="number"
                min={0}
                max={9}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Школа (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Стихия/фон</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {themeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              value={castingTime}
              onChange={(e) => setCastingTime(e.target.value)}
              placeholder="Время накладывания (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={rangeText}
              onChange={(e) => setRangeText(e.target.value)}
              placeholder="Дистанция (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={components}
              onChange={(e) => setComponents(e.target.value)}
              placeholder="Компоненты (например: В, С, М)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Длительность (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={classes}
              onChange={(e) => setClasses(e.target.value)}
              placeholder="Классы (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={subclasses}
              onChange={(e) => setSubclasses(e.target.value)}
              placeholder="Подклассы (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Источник (например PH) (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              value={sourcePages}
              onChange={(e) => setSourcePages(e.target.value)}
              placeholder="Страницы (например PH14) (опционально)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (опционально)"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
              Добавить
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 text-gray-700">Заклинаний не найдено.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSorted.map((s) => (
                <div key={s.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {Number.isFinite(Number(s.level))
                          ? Number(s.level) === 0
                            ? 'Заговор'
                            : `Ур. ${s.level}`
                          : 'Ур. ?'}
                      </span>
                    </div>
                    {(s.school || s.components) && (
                      <div className="text-sm text-gray-600 mt-1">{[s.school, s.components].filter(Boolean).join(' • ')}</div>
                    )}

                    {editingId === s.id ? (
                      <div className="mt-4 space-y-3">
                        <div className="text-sm font-semibold text-gray-900">Редактирование</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Название"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            placeholder="Название (EN) (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Уровень</label>
                            <input
                              type="number"
                              min={0}
                              max={9}
                              value={editLevel}
                              onChange={(e) => setEditLevel(e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <input
                            value={editSchool}
                            onChange={(e) => setEditSchool(e.target.value)}
                            placeholder="Школа (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Стихия/фон</label>
                            <select
                              value={editTheme}
                              onChange={(e) => setEditTheme(e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {themeOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            value={editCastingTime}
                            onChange={(e) => setEditCastingTime(e.target.value)}
                            placeholder="Время накладывания (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editRangeText}
                            onChange={(e) => setEditRangeText(e.target.value)}
                            placeholder="Дистанция (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editComponents}
                            onChange={(e) => setEditComponents(e.target.value)}
                            placeholder="Компоненты (например: В, С, М)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            placeholder="Длительность (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editClasses}
                            onChange={(e) => setEditClasses(e.target.value)}
                            placeholder="Классы (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editSubclasses}
                            onChange={(e) => setEditSubclasses(e.target.value)}
                            placeholder="Подклассы (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editSource}
                            onChange={(e) => setEditSource(e.target.value)}
                            placeholder="Источник (например PH) (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />

                          <input
                            value={editSourcePages}
                            onChange={(e) => setEditSourcePages(e.target.value)}
                            placeholder="Страницы (например PH14) (опционально)"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Описание (опционально)"
                          rows={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => saveEdit(s.id)}
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
                    {editingId === s.id ? null : (
                      <button
                        onClick={() => startEdit(s)}
                        className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                      >
                        Редактировать
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
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
