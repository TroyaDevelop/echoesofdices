import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { traitsAPI } from '../lib/api.js';
import SpellHeader from '../components/spells/SpellHeader.jsx';
import SpellDescription from '../components/spells/SpellDescription.jsx';
import LikeButton from '../components/spells/LikeButton.jsx';
import CommentsSection from '../components/spells/CommentsSection.jsx';
import ConfirmModal from '../components/spells/ConfirmModal.jsx';

export default function TraitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trait, setTrait] = useState(null);
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
      return localStorage.getItem('traits:showEot') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('traits:showEot', showEot ? '1' : '0');
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
          traitsAPI.getById(id),
          traitsAPI.getLikes(id),
          traitsAPI.listComments(id),
        ]);
        if (!isActive) return;
        setTrait(data);
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
        setError(e.message || 'Ошибка загрузки черты');
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
    if (!trait) return '';
    const base = String(trait.name || '').trim();
    const en = String(trait.name_en || '').trim();
    return en ? `${base} [${en}]` : base;
  }, [trait]);

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
    if (!trait) return;
    const c = deleteModal.comment;
    if (!c?.id) return;
    if (deleteModal.busy) return;

    setDeleteModal((p) => ({ ...p, busy: true }));
    setError('');
    try {
      await traitsAPI.deleteComment(trait.id, c.id);
      setComments((prev) => (prev || []).filter((x) => x.id !== c.id));
      setDeleteModal({ open: false, comment: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления комментария');
      setDeleteModal((p) => ({ ...p, busy: false }));
    }
  };

  const toggleLike = async () => {
    if (!trait) return;
    if (!canLike) {
      setError('Нужно войти, чтобы поставить лайк');
      navigate('/login');
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    setError('');
    try {
      const next = likes.liked ? await traitsAPI.unlike(trait.id) : await traitsAPI.like(trait.id);
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
    if (!trait) return;
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
      const created = await traitsAPI.addComment(trait.id, content);
      setComments((prev) => [...prev, created].filter(Boolean));
      setCommentText('');
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка отправки комментария');
    } finally {
      setCommentBusy(false);
    }
  };

  const sourceText = useMemo(() => String(trait?.source || '').trim(), [trait?.source]);
  const sourcePages = useMemo(() => String(trait?.source_pages || '').trim(), [trait?.source_pages]);
  const hasEotDescription = useMemo(() => Boolean(String(trait?.description_eot || '').trim()), [trait?.description_eot]);
  const activeDescription = useMemo(() => {
    if (!trait) return '';
    if (hasEotDescription && showEot) return trait.description_eot;
    return trait.description;
  }, [trait, hasEotDescription, showEot]);

  return (
    <div className="min-h-screen spell-page spell-page--none px-3 py-3 sm:px-6 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/traits" className="text-sm text-slate-300 hover:text-white transition-colors">
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
        ) : !trait ? (
          <div className="text-slate-300">Черта не найдена.</div>
        ) : (
          <div className="parchment-card rounded-lg border border-black/20 text-slate-900 shadow-2xl overflow-hidden">
            <SpellHeader
              title={title}
              subtitle="Черта"
              sourceText={sourceText}
              sourcePages={sourcePages}
              hasEotDescription={hasEotDescription}
              showEot={showEot}
              onToggleEot={setShowEot}
            />

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
