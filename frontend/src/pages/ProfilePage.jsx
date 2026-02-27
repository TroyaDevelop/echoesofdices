import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import CharacterSheet from '../components/profile/CharacterSheet.jsx';
import FriendsTab from '../components/profile/FriendsTab.jsx';
import { userProfileAPI, spellsAPI } from '../lib/api.js';
import { API_URL } from '../lib/config.js';

const formatJoinDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

const shortDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TABS = [
  { key: 'profile', label: 'Профиль' },
  { key: 'privacy', label: 'Приватность' },
  { key: 'sheet', label: 'Лист персонажа' },
  { key: 'favorites', label: 'Избранные заклинания' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const [profileStatusInput, setProfileStatusInput] = useState('');
  const [hideCharacterSheets, setHideCharacterSheets] = useState(false);
  const [hideFavoriteSpells, setHideFavoriteSpells] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  
  const [awards, setAwards] = useState([]);

  
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [characterBusy, setCharacterBusy] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState(null);

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeCharacterId) || null,
    [characters, activeCharacterId],
  );

  useEffect(() => {
    const onAuthLogout = () => {
      setProfile(null);
      setCharacters([]);
      setFavorites([]);
      setAwards([]);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', onAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', onAuthLogout);
    };
  }, [navigate]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, awardsList] = await Promise.all([
          userProfileAPI.get(),
          userProfileAPI.getAwards().catch(() => []),
        ]);
        if (!isActive) return;
        setProfile(data);
        setAwards(Array.isArray(awardsList) ? awardsList : []);
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        setError(e.message || 'Ошибка загрузки профиля');
        try {
          const token = localStorage.getItem('token');
          if (!token) navigate('/login', { replace: true });
        } catch {
          navigate('/login', { replace: true });
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [navigate]);

  
  useEffect(() => {
    if (tab !== 'favorites') return;
    let isActive = true;
    setFavLoading(true);
    spellsAPI.listFavorites()
      .then((data) => { if (isActive) setFavorites(Array.isArray(data) ? data : []); })
      .catch((e) => { if (isActive) setError(e.message || 'Ошибка загрузки избранного'); })
      .finally(() => { if (isActive) setFavLoading(false); });
    return () => { isActive = false; };
  }, [tab]);

  useEffect(() => {
    if (tab !== 'sheet') return;
    let isActive = true;
    setCharactersLoading(true);
    userProfileAPI.listCharacters()
      .then((data) => {
        if (!isActive) return;
        const list = Array.isArray(data) ? data : [];
        setCharacters(list);
        if (activeCharacterId && !list.find((c) => c.id === activeCharacterId)) {
          setActiveCharacterId(null);
        }
      })
      .catch((e) => { if (isActive) setError(e.message || 'Ошибка загрузки персонажей'); })
      .finally(() => { if (isActive) setCharactersLoading(false); });
    return () => { isActive = false; };
  }, [tab, activeCharacterId]);

  useEffect(() => {
    setProfileStatusInput(profile?.profile_status || '');
    setHideCharacterSheets(Boolean(profile?.hide_character_sheets));
    setHideFavoriteSpells(Boolean(profile?.hide_favorite_spells));
  }, [profile]);

  const displayName = useMemo(() => {
    if (!profile) return '';
    return profile.nickname || profile.login || 'Без имени';
  }, [profile]);

  const joinedDate = useMemo(() => formatJoinDate(profile?.created_at), [profile]);
  const baseUrl = API_URL.replace('/api', '');

  const removeFav = async (spellId) => {
    try {
      await spellsAPI.unfavorite(spellId);
      setFavorites((prev) => prev.filter((f) => f.spell_id !== spellId && f.id !== spellId));
    } catch (e) {
      setError(e.message || 'Ошибка');
    }
  };

  const createCharacter = async () => {
    if (characterBusy || characters.length >= 3) return;
    setCharacterBusy(true);
    setError('');
    try {
      const created = await userProfileAPI.createCharacter({});
      setCharacters((prev) => [...prev, created].filter(Boolean));
      setActiveCharacterId(created?.id || null);
    } catch (e) {
      setError(e.message || 'Ошибка создания листа');
    } finally {
      setCharacterBusy(false);
    }
  };

  const deleteCharacter = async (id) => {
    if (characterBusy) return;
    if (!window.confirm('Удалить лист персонажа?')) return;
    setCharacterBusy(true);
    setError('');
    try {
      await userProfileAPI.deleteCharacter(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      if (activeCharacterId === id) setActiveCharacterId(null);
    } catch (e) {
      setError(e.message || 'Ошибка удаления листа');
    } finally {
      setCharacterBusy(false);
    }
  };

  const handleCharacterSaved = (next) => {
    if (!next) return;
    setCharacters((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    setActiveCharacterId(next.id);
  };

  const saveProfileStatus = async () => {
    if (settingsBusy) return;
    setSettingsBusy(true);
    setError('');
    setSettingsSuccess('');
    try {
      const updated = await userProfileAPI.update({
        profile_status: profileStatusInput,
      });
      setProfile(updated);
      setSettingsSuccess('Статус профиля сохранен');
    } catch (e) {
      setError(e.message || 'Ошибка сохранения статуса профиля');
    } finally {
      setSettingsBusy(false);
    }
  };

  const savePrivacySettings = async () => {
    if (settingsBusy) return;
    setSettingsBusy(true);
    setError('');
    setSettingsSuccess('');
    try {
      const updated = await userProfileAPI.update({
        hide_character_sheets: hideCharacterSheets,
        hide_favorite_spells: hideFavoriteSpells,
      });
      setProfile(updated);
      setSettingsSuccess('Настройки приватности сохранены');
    } catch (e) {
      setError(e.message || 'Ошибка сохранения настроек приватности');
    } finally {
      setSettingsBusy(false);
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Профиль</h1>

        {error ? <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</div> : null}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : (
          <>
            {}
            <div className="flex gap-1 border-b border-white/10 pb-px overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    tab === t.key
                      ? 'bg-white/10 text-white border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'profile' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-2xl font-semibold text-slate-100">{displayName}</div>
                  {joinedDate ? (
                    <div className="mt-1 text-xs text-slate-400">Участник с {joinedDate}</div>
                  ) : null}
                  {profile?.profile_status ? (
                    <div className="mt-2 text-sm text-slate-300">Статус: {profile.profile_status}</div>
                  ) : null}
                  {profile?.character_name ? (
                    <div className="mt-3 text-sm text-slate-300">
                      <span className="text-slate-500">Персонаж:</span>{' '}
                      <span className="font-medium text-slate-100">{profile.character_name}</span>
                      {profile.race || profile.class_name ? (
                        <span className="text-slate-400">
                          {' '}— {[profile.race, profile.class_name].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                      {profile.character_level ? (
                        <span className="text-slate-500"> (Ур. {profile.character_level})</span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Награды</div>
                    {awards.length === 0 ? (
                      <div className="mt-2 text-sm text-slate-400">Награды пока не получены.</div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {awards.map((award) => (
                          <div key={award.id || award.award_id} className="flex items-center gap-2" title={award.description || award.name}>
                            {award.image_url ? (
                              <img
                                src={`${baseUrl}${award.image_url}`}
                                alt={award.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50"
                              />
                            ) : (
                              <span className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-lg border-2 border-amber-400/50">🏅</span>
                            )}
                            <span className="text-xs text-slate-300 whitespace-nowrap max-w-[9rem] truncate">{award.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-100">Статус профиля</div>
                    <div className="text-xs text-slate-400 mt-1">Этот статус увидят ваши соратники в вашем профиле.</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 block">Статус профиля</label>
                    <input
                      type="text"
                      value={profileStatusInput}
                      onChange={(e) => setProfileStatusInput(e.target.value)}
                      maxLength={160}
                      placeholder="Например: Ищу группу в воскресенье"
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveProfileStatus}
                      disabled={settingsBusy}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-60"
                    >
                      {settingsBusy ? 'Сохранение…' : 'Сохранить статус'}
                    </button>
                    {settingsSuccess ? <span className="text-xs text-emerald-300">{settingsSuccess}</span> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <FriendsTab profile={profile} />
                </div>
              </div>
            ) : null}

            {}
            {tab === 'sheet' ? (
              <div className="space-y-4">
                {!activeCharacter ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                      <div>
                        <div className="text-lg font-semibold text-slate-100">Ваши персонажи</div>
                        <div className="text-xs text-slate-400">Можно создать до 3 листов.</div>
                      </div>
                      <button
                        type="button"
                        onClick={createCharacter}
                        disabled={characterBusy || characters.length >= 3}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                      >
                        Создать лист
                      </button>
                    </div>

                    {charactersLoading ? (
                      <div className="text-slate-300 text-sm">Загрузка…</div>
                    ) : characters.length === 0 ? (
                      <div className="text-slate-400 text-sm">Листов персонажа пока нет.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {characters.map((ch) => (
                          <div
                            key={ch.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveCharacterId(ch.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveCharacterId(ch.id);
                              }
                            }}
                            className="text-left rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-base font-semibold text-slate-100">
                                  {ch.character_name || 'Без имени'}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {[ch.race, ch.class_name].filter(Boolean).join(', ') || '—'}
                                </div>
                                <div className="text-xs text-slate-500 mt-2">Уровень: {ch.character_level || 1}</div>
                                <div className="text-xs text-slate-500 mt-1">{ch.background || 'Без предыстории'}{ch.alignment ? ` • ${ch.alignment}` : ''}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Хиты: {ch.hp_current ?? 0}/{ch.hp_max ?? 0} • КД: {ch.armor_class ?? '—'}
                                </div>
                                {shortDateTime(ch.updated_at) ? (
                                  <div className="text-[11px] text-slate-600 mt-2">Обновлён: {shortDateTime(ch.updated_at)}</div>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCharacter(ch.id);
                                }}
                                className="text-xs text-red-300 hover:text-red-200"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveCharacterId(null)}
                        className="text-sm text-slate-300 hover:text-white"
                      >
                        ← К списку персонажей
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-400">{activeCharacter.character_name || 'Без имени'}</div>
                        <button
                          type="button"
                          onClick={() => deleteCharacter(activeCharacter.id)}
                          className="text-sm text-red-300 hover:text-red-200"
                        >
                          Удалить лист
                        </button>
                      </div>
                    </div>
                    <CharacterSheet
                      character={activeCharacter}
                      owner={profile}
                      onSaved={handleCharacterSaved}
                    />
                  </>
                )}
              </div>
            ) : null}

            {tab === 'privacy' ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div>
                  <div className="text-lg font-semibold text-slate-100">Настройки приватности</div>
                  <div className="text-xs text-slate-400 mt-1">Управляйте видимостью данных профиля для соратников.</div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={hideCharacterSheets}
                    onChange={(e) => setHideCharacterSheets(e.target.checked)}
                    className="rounded border-white/20 bg-black/30"
                  />
                  Скрыть информацию о листах персонажа от соратников
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={hideFavoriteSpells}
                    onChange={(e) => setHideFavoriteSpells(e.target.checked)}
                    className="rounded border-white/20 bg-black/30"
                  />
                  Скрыть избранные заклинания от соратников
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={savePrivacySettings}
                    disabled={settingsBusy}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-60"
                  >
                    {settingsBusy ? 'Сохранение…' : 'Сохранить приватность'}
                  </button>
                  {settingsSuccess ? <span className="text-xs text-emerald-300">{settingsSuccess}</span> : null}
                </div>
              </div>
            ) : null}

            {}
            {tab === 'favorites' ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold text-slate-100 mb-3">Избранные заклинания</h2>
                {favLoading ? (
                  <div className="text-slate-400 text-sm">Загрузка…</div>
                ) : favorites.length === 0 ? (
                  <div className="text-sm text-slate-400">
                    У вас пока нет избранных заклинаний. Добавляйте их с помощью кнопки ☆ на странице заклинания.
                  </div>
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
                          <button
                            type="button"
                            onClick={() => removeFav(spellId)}
                            className="text-amber-400 hover:text-amber-300 text-base flex-shrink-0"
                            title="Убрать из избранного"
                          >
                            ★
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
