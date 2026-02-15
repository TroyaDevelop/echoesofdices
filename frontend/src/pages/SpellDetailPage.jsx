import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { spellsAPI } from '../lib/api.js';
import { canManageCompendium } from '../lib/permissions.js';
import SpellHeader from '../components/spells/SpellHeader.jsx';
import SpellMetaGrid from '../components/spells/SpellMetaGrid.jsx';
import SpellDescription from '../components/spells/SpellDescription.jsx';
import LikeButton from '../components/spells/LikeButton.jsx';
import FavoriteButton from '../components/spells/FavoriteButton.jsx';
import CommentsSection from '../components/spells/CommentsSection.jsx';
import ConfirmModal from '../components/spells/ConfirmModal.jsx';

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
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

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
          if (likesData.favorited !== undefined) setFavorited(Boolean(likesData.favorited));
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
      return canManageCompendium(parsed);
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

  const toggleFavorite = async () => {
    if (!spell) return;
    if (!canLike) {
      navigate('/login');
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    setError('');
    try {
      if (favorited) {
        await spellsAPI.unfavorite(spell.id);
        setFavorited(false);
      } else {
        await spellsAPI.favorite(spell.id);
        setFavorited(true);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка избранного');
    } finally {
      setFavBusy(false);
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
            <SpellHeader
              title={title}
              subtitle={levelLine(spell.level, spell.school)}
              sourceText={sourceText}
              sourcePages={sourcePages}
              hasEotDescription={hasEotDescription}
              showEot={showEot}
              onToggleEot={setShowEot}
            />

            <SpellMetaGrid spell={spell} />

            <div className="px-4 sm:px-6 pb-4">
              <div className="h-px bg-black/10 mb-3" />
              <SpellDescription description={activeDescription} />

              <div className="h-px bg-black/10 my-4" />

              <div className="flex items-center justify-end gap-1 mt-2">
                <LikeButton
                  liked={likes.liked}
                  count={likes.count}
                  busy={likeBusy}
                  canLike={canLike}
                  onToggle={toggleLike}
                />
                <FavoriteButton
                  favorited={favorited}
                  busy={favBusy}
                  canFavorite={canLike}
                  onToggle={toggleFavorite}
                />
              </div>

              <CommentsSection
                comments={comments}
                commentsLoading={commentsLoading}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onSubmit={submitComment}
                commentBusy={commentBusy}
                canComment={canComment}
                canModerateComments={canModerateComments}
                onAskDelete={askDeleteComment}
              />

              <ConfirmModal
                open={deleteModal.open}
                title="Вы уверены?"
                message="Удалить комментарий?"
                busy={deleteModal.busy}
                onCancel={cancelDeleteComment}
                onConfirm={confirmDeleteComment}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
