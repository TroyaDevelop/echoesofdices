import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AwardsPanel from '../../components/admin/awards/AwardsPanel.jsx';
import SpellClassesPanel from '../../components/admin/spells/SpellClassesPanel.jsx';
import { loreAPI, sourcesAPI, spellClassesAPI } from '../../lib/api.js';

export default function AdminUtilitiesPage() {
  const [error, setError] = useState('');

  const [classItems, setClassItems] = useState([]);
  const [classDraft, setClassDraft] = useState('');
  const [classBusy, setClassBusy] = useState(false);

  const [locations, setLocations] = useState([]);
  const [locationsError, setLocationsError] = useState('');
  const [locationName, setLocationName] = useState('');

  const [sources, setSources] = useState([]);
  const [sourcesError, setSourcesError] = useState('');
  const [sourceName, setSourceName] = useState('');

  const load = async () => {
    setError('');
    try {
      const [classesData, locationsData, sourcesData] = await Promise.all([
        spellClassesAPI.listAdmin(),
        loreAPI.listLocationsAdmin(),
        sourcesAPI.listAdmin(),
      ]);
      setClassItems(Array.isArray(classesData) ? classesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setSources(Array.isArray(sourcesData) ? sourcesData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки утилит');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    setError('');
    const value = String(classDraft || '').trim();
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

  const handleCreateLocation = async () => {
    const name = String(locationName || '').trim();
    if (!name) return;
    setLocationsError('');
    try {
      await loreAPI.createLocation(name);
      setLocationName('');
      const next = await loreAPI.listLocationsAdmin();
      setLocations(Array.isArray(next) ? next : []);
    } catch (e) {
      console.error(e);
      setLocationsError(e.message || 'Ошибка создания локации');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm('Удалить локацию?')) return;
    setLocationsError('');
    try {
      await loreAPI.removeLocation(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (e) {
      console.error(e);
      setLocationsError(e.message || 'Ошибка удаления локации');
    }
  };

  const handleCreateSource = async () => {
    const name = String(sourceName || '').trim();
    if (!name) return;
    setSourcesError('');
    try {
      await sourcesAPI.create(name);
      setSourceName('');
      const next = await sourcesAPI.listAdmin();
      setSources(Array.isArray(next) ? next : []);
    } catch (e) {
      console.error(e);
      setSourcesError(e.message || 'Ошибка создания источника');
    }
  };

  const handleDeleteSource = async (id) => {
    if (!confirm('Удалить источник?')) return;
    setSourcesError('');
    try {
      await sourcesAPI.remove(id);
      setSources((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
      setSourcesError(e.message || 'Ошибка удаления источника');
    }
  };

  const shouldScrollLocations = locations.length > 4;
  const shouldScrollSources = sources.length > 4;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="text-2xl font-bold text-gray-900">Утилиты</div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-lg font-semibold text-gray-900">Локации</div>
              <div className="text-sm text-gray-600">Используются как места действия в лоре.</div>
            </div>

            {locationsError ? <div className="text-sm text-red-600">{locationsError}</div> : null}

            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Новая локация"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleCreateLocation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                Добавить
              </button>
            </div>

            {locations.length === 0 ? (
              <div className="text-sm text-gray-500">Локаций пока нет.</div>
            ) : (
              <div
                className={`rounded-lg border border-gray-200 ${shouldScrollLocations ? 'max-h-48 overflow-y-auto' : ''}`}
              >
                <ul className="divide-y divide-gray-200">
                  {locations.map((loc) => (
                    <li key={loc.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="text-gray-800">{loc.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Удалить ${loc.name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-lg font-semibold text-gray-900">Источники</div>
              <div className="text-sm text-gray-600">Доступны для заклинаний, черт, предметов и статей.</div>
            </div>

            {sourcesError ? <div className="text-sm text-red-600">{sourcesError}</div> : null}

            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Новый источник"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleCreateSource}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                Добавить
              </button>
            </div>

            {sources.length === 0 ? (
              <div className="text-sm text-gray-500">Источников пока нет.</div>
            ) : (
              <div
                className={`rounded-lg border border-gray-200 ${shouldScrollSources ? 'max-h-48 overflow-y-auto' : ''}`}
              >
                <ul className="divide-y divide-gray-200">
                  {sources.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="text-gray-800">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSource(item.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Удалить ${item.name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <SpellClassesPanel
            value={classDraft}
            onValueChange={setClassDraft}
            onAdd={handleAddClass}
            items={classItems}
            onRemove={handleRemoveClass}
            busy={classBusy}
          />

          <AwardsPanel />
        </div>
      </div>
    </AdminLayout>
  );
}
