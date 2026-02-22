import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import CharacterSheet from '../components/profile/CharacterSheet.jsx';
import { socialAPI } from '../lib/api.js';

const formatJoinDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatLastSeen = (value) => {
  if (!value) return 'Не в сети';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Не в сети';
  return `Был в сети ${date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export default function FriendProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await socialAPI.getFriendProfile(id);
        setProfile(data);

        const [chars, favs] = await Promise.all([
          data?.can_view_characters ? socialAPI.getFriendCharacters(id) : Promise.resolve([]),
          data?.can_view_favorites ? socialAPI.getFriendFavorites(id) : Promise.resolve([]),
        ]);
        setCharacters(Array.isArray(chars) ? chars : []);
        setFavorites(Array.isArray(favs) ? favs : []);
        if (Array.isArray(chars) && chars.length > 0) {
          setActiveCharacterId(chars[0].id);
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки профиля друга');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto p-4 text-slate-400">Загрузка...</div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-900/50 text-red-200 p-4 rounded border border-red-700">{error}</div>
          <button onClick={() => navigate('/profile')} className="mt-4 text-slate-300 hover:text-white">Вернуться в профиль</button>
        </div>
      </PublicLayout>
    );
  }

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || null;
  const joinedDate = formatJoinDate(profile?.created_at);

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">Профиль: {profile.nickname || profile.login}</h1>
          <button onClick={() => navigate('/profile')} className="text-slate-400 hover:text-white">Назад</button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-2xl font-semibold text-slate-100">{profile.nickname || profile.login}</div>
          {joinedDate ? <div className="mt-1 text-xs text-slate-400">Участник с {joinedDate}</div> : null}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${profile?.is_online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className={profile?.is_online ? 'text-emerald-300' : 'text-slate-400'}>
              {profile?.is_online ? 'Сейчас в сети' : formatLastSeen(profile?.last_seen_at)}
            </span>
          </div>
          {profile?.profile_status ? <div className="mt-2 text-sm text-slate-300">Статус: {profile.profile_status}</div> : null}
          {(profile.character_name || profile.race || profile.class_name || profile.character_level) ? (
            <div className="mt-3 text-sm text-slate-300">
              {profile.character_name ? (
                <div>
                  <span className="text-slate-500">Персонаж:</span>{' '}
                  <span className="font-medium text-slate-100">{profile.character_name}</span>
                </div>
              ) : null}
              {(profile.race || profile.class_name) ? (
                <div>
                  <span className="text-slate-500">Класс/раса:</span>{' '}
                  {[profile.race, profile.class_name].filter(Boolean).join(', ')}
                </div>
              ) : null}
              {profile.character_level ? (
                <div>
                  <span className="text-slate-500">Уровень:</span> {profile.character_level}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Листы персонажей</h2>
          {!profile?.can_view_characters ? (
            <p className="text-slate-400">Пользователь скрыл информацию о листах персонажа.</p>
          ) : characters.length === 0 ? (
            <p className="text-slate-400">У пользователя нет листов персонажей.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCharacterId(c.id)}
                  className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${
                    activeCharacterId === c.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {c.character_name || c.name || 'Безымянный'}
                </button>
              ))}
            </div>
          )}
        </div>

        {profile?.can_view_characters && activeCharacter && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <CharacterSheet character={activeCharacter} owner={profile} onSaved={() => {}} readOnly />
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Избранные заклинания</h2>
          {!profile?.can_view_favorites ? (
            <p className="text-slate-400">Пользователь скрыл избранные заклинания.</p>
          ) : favorites.length === 0 ? (
            <p className="text-slate-400">У пользователя нет избранных заклинаний.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map((fav) => {
                const spellId = fav.spell_id || fav.id;
                return (
                  <li key={spellId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                    <Link
                      to={`/spells/${spellId}`}
                      className="flex-1 text-sm font-medium text-purple-300 hover:text-purple-200 truncate"
                    >
                      {fav.name || fav.spell_name || `Заклинание #${spellId}`}
                    </Link>
                    {fav.level !== undefined ? (
                      <span className="text-xs text-slate-500">{Number(fav.level) === 0 ? 'Заговор' : `${fav.level} ур.`}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
