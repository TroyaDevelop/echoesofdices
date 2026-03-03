import { useEffect, useState } from 'react';
import { adminAPI } from '../../../lib/api.js';
import { API_URL } from '../../../lib/config.js';

export default function GiftsPanel() {
  const [gifts, setGifts] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await adminAPI.listGifts();
      setGifts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки подарков');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const title = String(name || '').trim();
    const parsedPrice = Number(price);

    if (!title) {
      setError('Название обязательно');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Цена должна быть неотрицательным числом');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', title);
      fd.append('price_free_morale', String(Math.trunc(parsedPrice)));
      if (description.trim()) fd.append('description', description.trim());
      if (imageFile) fd.append('image', imageFile);
      await adminAPI.createGift(fd);
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка создания подарка');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить подарок из магазина?')) return;
    setError('');
    try {
      await adminAPI.deleteGift(id);
      setGifts((prev) => prev.filter((gift) => gift.id !== id));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления подарка');
    }
  };

  const shouldScroll = gifts.length > 4;
  const baseUrl = API_URL.replace('/api', '');

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <div>
        <div className="text-lg font-semibold text-gray-900">Подарки магазина</div>
        <div className="text-sm text-gray-600">Добавляйте новые подарки с ценой и изображением.</div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <form onSubmit={handleCreate} className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название подарка"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          value={price}
          type="number"
          min="0"
          step="1"
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена (свободная мораль)"
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
            {busy ? 'Создаю…' : 'Добавить подарок'}
          </button>
        </div>
      </form>

      {gifts.length === 0 ? (
        <div className="text-sm text-gray-500">Подарков пока нет.</div>
      ) : (
        <div className={`rounded-lg border border-gray-200 ${shouldScroll ? 'max-h-60 overflow-y-auto' : ''}`}>
          <ul className="divide-y divide-gray-200">
            {gifts.map((gift) => {
              const imageUrl = gift.image_url
                ? (String(gift.image_url).startsWith('http') ? gift.image_url : `${baseUrl}${gift.image_url}`)
                : null;

              return (
                <li key={gift.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-8 h-8 rounded object-cover flex-shrink-0 border border-gray-200"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-600 text-lg flex-shrink-0">🎁</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{gift.name}</div>
                    <div className="text-xs text-gray-500 truncate">Цена: {Number(gift.price_free_morale || 0)} свободной морали</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(gift.id)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                    aria-label={`Удалить ${gift.name}`}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
