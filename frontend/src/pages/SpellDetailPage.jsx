import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { spellsAPI } from '../lib/api.js';
import { isRichHtmlDescription, sanitizeSpellDescriptionHtml } from '../lib/richText.js';

const field = (v) => {
  const s = String(v ?? '').trim();
  return s ? s : '—';
};

const levelLine = (level, school) => {
  const lvl = Number(level);
  const parts = [];
  if (Number.isFinite(lvl)) parts.push(lvl === 0 ? 'Заговор' : `${lvl} уровень`);
  if (school) parts.push(String(school));
  return parts.join(', ');
};

export default function SpellDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, comment: null, busy: false });

  const [showEot, setShowEot] = useState(() => {
    try {
      return localStorage.getItem('spells:showEot') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('spells:showEot', showEot ? '1' : '0');
    } catch {
    }
  }, [showEot]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, likesData, commentsData] = await Promise.all([
          spellsAPI.getById(id),
          spellsAPI.getLikes(id),
          spellsAPI.listComments(id),
        ]);
        if (!isActive) return;
        setSpell(data);
        if (likesData && typeof likesData === 'object') {
          setLikes({
            count: Number(likesData.count || 0),
            liked: Boolean(likesData.liked),
          });
        }

        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        setError(e.message || 'Ошибка загрузки заклинания');
      } finally {
        if (!isActive) return;
        setLoading(false);
        setCommentsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [id]);

  const title = useMemo(() => {
    if (!spell) return '';
    const base = String(spell.name || '').trim();
    const en = String(spell.name_en || '').trim();
    return en ? `${base} [${en}]` : base;
  }, [spell]);

  const theme = useMemo(() => {
    const raw = String(spell?.theme || 'none').trim().toLowerCase();
    const allowed = new Set([
      'none',
      'fire',
      'cold',
      'lightning',
      'acid',
      'poison',
      'necrotic',
      'radiant',
      'psychic',
      'force',
      'thunder',
    ]);
    return allowed.has(raw) ? raw : 'none';
  }, [spell]);

  const canLike = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('token'));
    } catch {
      return false;
    }
  }, []);

  const canModerateComments = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const role = parsed ? String(parsed?.role || '').toLowerCase() : '';
      return role === 'editor';
    } catch {
      return false;
    }
  }, []);

  const askDeleteComment = (comment) => {
    setError('');
    setDeleteModal({ open: true, comment, busy: false });
  };

  const cancelDeleteComment = () => setDeleteModal({ open: false, comment: null, busy: false });

  const confirmDeleteComment = async () => {
    if (!spell) return;
    const c = deleteModal.comment;
    if (!c?.id) return;
    if (deleteModal.busy) return;

    setDeleteModal((p) => ({ ...p, busy: true }));
    setError('');
    try {
      await spellsAPI.deleteComment(spell.id, c.id);
      setComments((prev) => (prev || []).filter((x) => x.id !== c.id));
      setDeleteModal({ open: false, comment: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления комментария');
      setDeleteModal((p) => ({ ...p, busy: false }));
    }
  };

  const toggleLike = async () => {
    if (!spell) return;
    if (!canLike) {
      setError('Нужно войти, чтобы поставить лайк');
      navigate('/login');
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    setError('');
    try {
      const next = likes.liked ? await spellsAPI.unlike(spell.id) : await spellsAPI.like(spell.id);
      setLikes({
        count: Number(next?.count || 0),
        liked: Boolean(next?.liked),
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка лайка');
    } finally {
      setLikeBusy(false);
    }
  };

  const canComment = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('token'));
    } catch {
      return false;
    }
  }, []);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!spell) return;
    if (!canComment) {
      setError('Нужно войти, чтобы комментировать');
      navigate('/login');
      return;
    }

    const content = String(commentText || '').trim();
    if (!content) return;
    if (commentBusy) return;

    setCommentBusy(true);
    setError('');
    try {
      const created = await spellsAPI.addComment(spell.id, content);
      setComments((prev) => [...prev, created].filter(Boolean));
      setCommentText('');
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка отправки комментария');
    } finally {
      setCommentBusy(false);
    }
  };

  const formatCommentDate = (value) => {
    try {
      return new Date(value).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(value || '');
    }
  };

  const commentAuthor = (c) => {
    const nickname = String(c?.author_nickname || '').trim();
    const login = String(c?.author_login || '').trim();
    return nickname || login || '—';
  };

  const hasEotDescription = useMemo(() => {
    return Boolean(String(spell?.description_eot || '').trim());
  }, [spell?.description_eot]);

  const activeDescription = useMemo(() => {
    if (!spell) return '';
    if (hasEotDescription && showEot) return spell.description_eot;
    return spell.description;
  }, [spell, hasEotDescription, showEot]);

  const sourceText = useMemo(() => String(spell?.source || '').trim(), [spell?.source]);
  const sourcePages = useMemo(() => String(spell?.source_pages || '').trim(), [spell?.source_pages]);
  const pagesLabel = useMemo(() => (sourcePages ? `стр. ${sourcePages}` : ''), [sourcePages]);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pagesTipHover, setPagesTipHover] = useState(false);
  const [pagesTipPinned, setPagesTipPinned] = useState(false);
  const pagesTipRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsTouchDevice(Boolean(mq.matches));
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  useEffect(() => {
    if (!pagesTipPinned) return;
    const onPointerDown = (e) => {
      const root = pagesTipRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setPagesTipPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pagesTipPinned]);

  const showPagesTip = Boolean(sourcePages) && (pagesTipPinned || pagesTipHover);

  return (
    <div className={`min-h-screen spell-page spell-page--${theme} px-3 py-3 sm:px-6 sm:py-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/spells" className="text-sm text-slate-300 hover:text-white transition-colors">
            ← К списку
          </Link>

          <button
            type="button"
            className="w-9 h-9 rounded-md bg-emerald-200/20 border border-emerald-200/30 text-emerald-100 hover:bg-emerald-200/30 transition-colors"
            aria-label="Меню"
            title="Меню"
          >
            ⋮
          </button>
        </div>

        {error && (
          <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : !spell ? (
          <div className="text-slate-300">Заклинание не найдено.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-black/10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold leading-tight break-words">
                      {title || 'Без названия'}
                    </h1>
                    {sourceText || sourcePages ? (
                      <span
                        ref={pagesTipRef}
                        className="relative inline-flex items-center rounded-md border border-black/20 bg-white/50 px-2 py-0.5 text-xs font-semibold text-slate-800"
                        onMouseEnter={() => {
                          if (!isTouchDevice) setPagesTipHover(true);
                        }}
                        onMouseLeave={() => {
                          if (!isTouchDevice) setPagesTipHover(false);
                        }}
                        onClick={() => {
                          if (!isTouchDevice) return;
                          if (!sourcePages) return;
                          setPagesTipPinned((v) => !v);
                        }}
                        role={isTouchDevice && sourcePages ? 'button' : undefined}
                        tabIndex={isTouchDevice && sourcePages ? 0 : undefined}
                        aria-label={pagesLabel || undefined}
                      >
                        {sourceText || 'стр.'}

                        {sourcePages ? (
                          <span
                            className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-20 whitespace-nowrap rounded-md border border-black/20 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-lg transition-all duration-150 ease-out ${
                              showPagesTip
                                ? 'opacity-100 translate-x-0 pointer-events-none'
                                : 'opacity-0 translate-x-1 pointer-events-none'
                            }`}
                          >
                            {pagesLabel}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm text-slate-700 italic">
                    {levelLine(spell.level, spell.school) || '—'}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasEotDescription ? (
                    <div className="inline-flex rounded-md border border-black/15 bg-white/40 p-0.5">
                      <button
                        type="button"
                        onClick={() => setShowEot(false)}
                        className={
                          showEot
                            ? 'px-2 py-1 rounded text-xs text-slate-800 hover:bg-white/60'
                            : 'px-2 py-1 rounded text-xs font-semibold bg-white/70 text-slate-900'
                        }
                        title="Показать только оригинал"
                      >
                        Оригинал
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEot(true)}
                        className={
                          showEot
                            ? 'px-2 py-1 rounded text-xs font-semibold bg-white/70 text-slate-900'
                            : 'px-2 py-1 rounded text-xs text-slate-800 hover:bg-white/60'
                        }
                        title="Показать версию Echoes of Times"
                      >
                        EoT
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 space-y-1 text-[15px]">
              <div>
                <span className="font-semibold">Время накладывания:</span> {field(spell.casting_time)}
              </div>
              <div>
                <span className="font-semibold">Дистанция:</span> {field(spell.range_text)}
              </div>
              <div>
                <span className="font-semibold">Компоненты:</span> {field(spell.components)}
              </div>
              <div>
                <span className="font-semibold">Длительность:</span> {field(spell.duration)}
              </div>
              <div>
                <span className="font-semibold">Классы:</span> {field(spell.classes)}
              </div>
              <div>
                <span className="font-semibold">Подклассы:</span> {field(spell.subclasses)}
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4">
              <div className="h-px bg-black/10 mb-3" />
              {activeDescription ? (
                isRichHtmlDescription(activeDescription) ? (
                  <div
                    className="spell-description leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeSpellDescriptionHtml(activeDescription) }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{String(activeDescription)}</div>
                )
              ) : (
                <div className="leading-relaxed">—</div>
              )}

              <div className="h-px bg-black/10 my-4" />

              <div className="flex items-center justify-end mb-3">
                <button
                  type="button"
                  onClick={toggleLike}
                  disabled={likeBusy}
                  className={`px-3 py-1.5 rounded-md border text-sm transition-colors shadow-sm ${
                    likes.liked
                      ? 'bg-pink-600/15 border-pink-700/30 text-pink-900'
                      : 'bg-white/60 border-black/20 text-slate-900'
                  }`}
                  title={canLike ? 'Поставить/снять лайк' : 'Войдите, чтобы лайкнуть'}
                >
                  {likes.liked ? '♥' : '♡'} {Number.isFinite(Number(likes.count)) ? likes.count : 0}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-lg font-semibold">Комментарии</h2>
                </div>

                <form onSubmit={submitComment} className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={canComment ? 'Написать комментарий…' : 'Войдите, чтобы комментировать'}
                    disabled={!canComment || commentBusy}
                    rows={3}
                    className="w-full rounded-md border border-black/20 bg-white/50 px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={!canComment || commentBusy || !String(commentText || '').trim()}
                      className="px-4 py-2 rounded-md bg-purple-700 text-white disabled:bg-purple-300"
                    >
                      {commentBusy ? 'Отправляю…' : 'Отправить'}
                    </button>
                  </div>
                </form>

                {commentsLoading ? (
                  <div className="text-slate-700">Загрузка комментариев…</div>
                ) : comments.length === 0 ? (
                  <div className="text-slate-700">Пока нет комментариев.</div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="rounded-md border border-black/10 bg-white/40 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-700">
                          <div className="font-semibold">{commentAuthor(c)}</div>
                          <div className="flex items-center gap-2">
                            <div>{formatCommentDate(c.created_at)}</div>
                            {canModerateComments ? (
                              <button
                                type="button"
                                onClick={() => askDeleteComment(c)}
                                className="px-2 py-1 rounded border border-red-300/60 bg-white/40 text-red-800 hover:bg-red-500/10"
                              >
                                Удалить
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-slate-900">{String(c.content || '')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {deleteModal.open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div className="absolute inset-0 bg-black/40" onClick={cancelDeleteComment} />
                  <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl border border-gray-200 p-5">
                    <div className="text-lg font-semibold text-gray-900">Вы уверены?</div>
                    <div className="mt-2 text-sm text-gray-600">Удалить комментарий?</div>

                    <div className="mt-5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelDeleteComment}
                        disabled={deleteModal.busy}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        Нет
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteComment}
                        disabled={deleteModal.busy}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {deleteModal.busy ? 'Удаляю…' : 'Да'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
