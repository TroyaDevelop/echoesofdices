import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { wondrousItemsAPI } from '../lib/api.js';
import SpellHeader from '../components/spells/SpellHeader.jsx';
import SpellDescription from '../components/spells/SpellDescription.jsx';
import LikeButton from '../components/spells/LikeButton.jsx';
import CommentsSection from '../components/spells/CommentsSection.jsx';
import ConfirmModal from '../components/spells/ConfirmModal.jsx';
import WondrousItemMetaGrid from '../components/wondrous-items/WondrousItemMetaGrid.jsx';

const rarityLabel = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'common') return 'обычный';
  if (v === 'uncommon') return 'необычный';
  if (v === 'rare') return 'редкий';
  if (v === 'very_rare') return 'очень редкий';
  if (v === 'legendary') return 'легендарный';
  if (v === 'artifact') return 'артефакт';
  return '';
};

export default function WondrousItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
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
      return localStorage.getItem('wondrous-items:showEot') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wondrous-items:showEot', showEot ? '1' : '0');
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
          wondrousItemsAPI.getById(id),
          wondrousItemsAPI.getLikes(id),
          wondrousItemsAPI.listComments(id),
        ]);
        if (!isActive) return;
        setItem(data);
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
        setError(e.message || 'Ошибка загрузки предмета');
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
    if (!item) return '';
    const base = String(item.name || '').trim();
    const en = String(item.name_en || '').trim();
    return en ? `${base} [${en}]` : base;
  }, [item]);

  const subtitle = useMemo(() => {
    if (!item) return '';
    const type = String(item?.item_type || '').trim() || 'Чудесный предмет';
    const eotRarity = String(item?.rarity_eot || '').trim();
    const baseRarity = String(item?.rarity || '').trim();
    const activeRarity = showEot && eotRarity ? eotRarity : baseRarity;
    const rarity = rarityLabel(activeRarity);
    const base = [type, rarity].filter(Boolean).join(', ');
    const requiresAttunement = Boolean(item?.attunement_required);
    if (!requiresAttunement) return base;
    const by = String(item?.attunement_by || '').trim();
    const tail = by ? `(требуется настройка ${by})` : '(требуется настройка)';
    return base ? `${base} ${tail}` : tail;
  }, [item]);

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
    if (!item) return;
    const c = deleteModal.comment;
    if (!c?.id) return;
    if (deleteModal.busy) return;

    setDeleteModal((p) => ({ ...p, busy: true }));
    setError('');
    try {
      await wondrousItemsAPI.deleteComment(item.id, c.id);
      setComments((prev) => (prev || []).filter((x) => x.id !== c.id));
      setDeleteModal({ open: false, comment: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления комментария');
      setDeleteModal((p) => ({ ...p, busy: false }));
    }
  };

  const toggleLike = async () => {
    if (!item) return;
    if (!canLike) {
      setError('Нужно войти, чтобы поставить лайк');
      navigate('/login');
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    setError('');
    try {
      const next = likes.liked ? await wondrousItemsAPI.unlike(item.id) : await wondrousItemsAPI.like(item.id);
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
    if (!item) return;
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
      const created = await wondrousItemsAPI.addComment(item.id, content);
      setComments((prev) => [...prev, created].filter(Boolean));
      setCommentText('');
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка отправки комментария');
    } finally {
      setCommentBusy(false);
    }
  };

  const sourceText = useMemo(() => String(item?.source || '').trim(), [item?.source]);
  const sourcePages = useMemo(() => String(item?.source_pages || '').trim(), [item?.source_pages]);
  const hasEotDescription = useMemo(() => Boolean(String(item?.description_eot || '').trim()), [item?.description_eot]);
  const activeRecommendedCost = useMemo(() => {
    const base = String(item?.recommended_cost || '').trim();
    const eot = String(item?.recommended_cost_eot || '').trim();
    if (showEot && eot) return eot;
    return base;
  }, [item?.recommended_cost, item?.recommended_cost_eot, showEot]);
  const activeDescription = useMemo(() => {
    if (!item) return '';
    if (hasEotDescription && showEot) return item.description_eot;
    return item.description;
  }, [item, hasEotDescription, showEot]);

  return (
    <div className="min-h-screen spell-page spell-page--none px-3 py-3 sm:px-6 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/wondrous-items" className="text-sm text-slate-300 hover:text-white transition-colors">
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
        ) : !item ? (
          <div className="text-slate-300">Предмет не найден.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <SpellHeader
              title={title}
              subtitle={subtitle}
              sourceText={sourceText}
              sourcePages={sourcePages}
              hasEotDescription={hasEotDescription}
              showEot={showEot}
              onToggleEot={setShowEot}
            />

            <WondrousItemMetaGrid recommendedCost={activeRecommendedCost} />

            <div className="px-4 sm:px-6 pb-4">
              <div className="h-px bg-black/10 mb-3" />
              <SpellDescription description={activeDescription} />

              <div className="h-px bg-black/10 my-4" />

              <LikeButton
                liked={likes.liked}
                count={likes.count}
                busy={likeBusy}
                canLike={canLike}
                onToggle={toggleLike}
              />

              <CommentsSection
                comments={comments}
                commentsLoading={commentsLoading}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onSubmit={submitComment}
                canModerate={canModerateComments}
                onDeleteComment={askDeleteComment}
                canComment={canComment}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title="Удалить комментарий?"
        description="Комментарий будет удален без возможности восстановления."
        confirmLabel={deleteModal.busy ? 'Удаление…' : 'Удалить'}
        onConfirm={confirmDeleteComment}
        onCancel={cancelDeleteComment}
        busy={deleteModal.busy}
      />
    </div>
  );
}
