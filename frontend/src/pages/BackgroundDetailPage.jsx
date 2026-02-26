import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { backgroundsAPI } from '../lib/api.js';
import { canManageCompendium } from '../lib/permissions.js';
import SpellHeader from '../components/spells/SpellHeader.jsx';
import SpellDescription from '../components/spells/SpellDescription.jsx';
import LikeButton from '../components/spells/LikeButton.jsx';
import CommentsSection from '../components/spells/CommentsSection.jsx';
import ConfirmModal from '../components/spells/ConfirmModal.jsx';

export default function BackgroundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [background, setBackground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, comment: null, busy: false });

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, likesData, commentsData] = await Promise.all([
          backgroundsAPI.getById(id),
          backgroundsAPI.getLikes(id),
          backgroundsAPI.listComments(id),
        ]);
        if (!isActive) return;
        setBackground(data);
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
        setError(e.message || 'Ошибка загрузки предыстории');
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
    if (!background) return '';
    const base = String(background.name || '').trim();
    const en = String(background.name_en || '').trim();
    return en ? `${base} [${en}]` : base;
  }, [background]);

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

  const canComment = canLike;

  const toggleLike = async () => {
    if (!background) return;
    if (!canLike) {
      setError('Нужно войти, чтобы поставить лайк');
      navigate('/login');
      return;
    }
    if (likeBusy) return;

    setLikeBusy(true);
    setError('');
    try {
      const next = likes.liked
        ? await backgroundsAPI.unlike(background.id)
        : await backgroundsAPI.like(background.id);
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

  const submitComment = async (e) => {
    e.preventDefault();
    if (!background) return;
    if (!canComment) {
      setError('Нужно войти, чтобы комментировать');
      navigate('/login');
      return;
    }

    const content = String(commentText || '').trim();
    if (!content || commentBusy) return;

    setCommentBusy(true);
    setError('');
    try {
      const created = await backgroundsAPI.addComment(background.id, content);
      setComments((prev) => [...prev, created].filter(Boolean));
      setCommentText('');
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка отправки комментария');
    } finally {
      setCommentBusy(false);
    }
  };

  const askDeleteComment = (comment) => {
    setError('');
    setDeleteModal({ open: true, comment, busy: false });
  };

  const cancelDeleteComment = () => setDeleteModal({ open: false, comment: null, busy: false });

  const confirmDeleteComment = async () => {
    if (!background) return;
    const c = deleteModal.comment;
    if (!c?.id || deleteModal.busy) return;

    setDeleteModal((prev) => ({ ...prev, busy: true }));
    setError('');
    try {
      await backgroundsAPI.deleteComment(background.id, c.id);
      setComments((prev) => (prev || []).filter((item) => item.id !== c.id));
      setDeleteModal({ open: false, comment: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления комментария');
      setDeleteModal((prev) => ({ ...prev, busy: false }));
    }
  };

  const sourceText = useMemo(() => String(background?.source || '').trim(), [background?.source]);
  const subtitle = 'Предыстория';

  return (
    <div className="min-h-screen spell-page spell-page--none px-3 py-3 sm:px-6 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/backgrounds" className="text-sm text-slate-300 hover:text-white transition-colors">
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

        {error && <div className="text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">{error}</div>}

        {loading ? (
          <div className="text-slate-300">Загрузка…</div>
        ) : !background ? (
          <div className="text-slate-300">Предыстория не найдена.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <SpellHeader
              title={title}
              subtitle={subtitle}
              sourceText={sourceText}
              hasEotDescription={false}
              showEot={false}
              onToggleEot={() => {}}
            />

            <div className="px-4 sm:px-6 pb-4 space-y-4">
              <div className="h-px bg-black/10" />

              <div className="space-y-1 text-sm sm:text-base leading-relaxed">
                {background.skill_proficiencies ? <div><strong>Владение навыками:</strong> {background.skill_proficiencies}</div> : null}
                {background.tool_proficiencies ? <div><strong>Владение инструментами:</strong> {background.tool_proficiencies}</div> : null}
                {background.equipment ? <div><strong>Снаряжение:</strong> {background.equipment}</div> : null}
              </div>

              {background.description ? (
                <div className="space-y-2">
                  <h3 className="text-red-800 uppercase font-bold tracking-wide text-lg sm:text-xl">ОПИСАНИЕ</h3>
                  <div className="h-px w-full bg-black/15" />
                  <SpellDescription description={background.description} />
                </div>
              ) : null}

              {background.feature_description ? (
                <div className="space-y-2">
                  {background.feature_title ? <h3 className="text-red-800 uppercase font-bold tracking-wide">{background.feature_title}</h3> : null}
                  <SpellDescription description={background.feature_description} />
                </div>
              ) : null}

              {background.personalization ? (
                <div className="space-y-2">
                  <h3 className="text-red-800 uppercase font-bold tracking-wide text-lg sm:text-xl">ПЕРСОНАЛИЗАЦИЯ</h3>
                  <div className="h-px w-full bg-black/15" />
                  <SpellDescription description={background.personalization} />
                </div>
              ) : null}

              <div className="h-px bg-black/10 my-4" />

              <div className="flex items-center justify-end mb-3">
                <LikeButton
                  liked={likes.liked}
                  count={likes.count}
                  busy={likeBusy}
                  canLike={canLike}
                  onToggle={toggleLike}
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
