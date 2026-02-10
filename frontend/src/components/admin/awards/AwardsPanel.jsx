import { useEffect, useState } from 'react';
import { adminAPI } from '../../../lib/api.js';
import { API_URL } from '../../../lib/config.js';

export default function AwardsPanel() {
  const [awards, setAwards] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await adminAPI.listAwards();
      setAwards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки наград');
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Название обязательно'); return; }
    setError('');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      if (description.trim()) fd.append('description', description.trim());
      if (imageFile) fd.append('image', imageFile);
      await adminAPI.createAward(fd);
      setName('');
      setDescription('');
      setImageFile(null);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка создания награды');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить награду?')) return;
    setError('');
    try {
      await adminAPI.deleteAward(id);
      setAwards((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления');
    }
  };

  const shouldScroll = awards.length > 4;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <div>
        <div className="text-lg font-semibold text-gray-900">Награды</div>
        <div className="text-sm text-gray-600">Создавайте медали для выдачи пользователям.</div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <form onSubmit={handleCreate} className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название награды"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание (необязательно)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-600 cursor-pointer">
            <span className="px-3 py-2 border border-gray-300 rounded-lg text-sm inline-block hover:bg-gray-50">
              {imageFile ? imageFile.name : 'Выбрать изображение'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {busy ? 'Создаю…' : 'Создать'}
          </button>
        </div>
      </form>

      {awards.length === 0 ? (
        <div className="text-sm text-gray-500">Наград пока нет.</div>
      ) : (
        <div className={`rounded-lg border border-gray-200 ${shouldScroll ? 'max-h-60 overflow-y-auto' : ''}`}>
          <ul className="divide-y divide-gray-200">
            {awards.map((award) => (
              <li key={award.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                {award.image_url ? (
                  <img
                    src={`${API_URL.replace('/api', '')}${award.image_url}`}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg flex-shrink-0">🏅</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{award.name}</div>
                  {award.description ? <div className="text-xs text-gray-500 truncate">{award.description}</div> : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(award.id)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                  aria-label={`Удалить ${award.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
