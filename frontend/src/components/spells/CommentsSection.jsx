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

const commentAuthor = (comment) => {
  const nickname = String(comment?.author_nickname || '').trim();
  const login = String(comment?.author_login || '').trim();
  return nickname || login || '—';
};

export default function CommentsSection({
  comments,
  commentsLoading,
  commentText,
  onCommentTextChange,
  onSubmit,
  commentBusy,
  canComment,
  canModerateComments,
  onAskDelete,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">Комментарии</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
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
      ) : (comments || []).length === 0 ? (
        <div className="text-slate-700">Пока нет комментариев.</div>
      ) : (
        <div className="space-y-3">
          {(comments || []).map((comment) => (
            <div key={comment.id} className="rounded-md border border-black/10 bg-white/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-700">
                <div className="font-semibold">{commentAuthor(comment)}</div>
                <div className="flex items-center gap-2">
                  <div>{formatCommentDate(comment.created_at)}</div>
                  {canModerateComments ? (
                    <button
                      type="button"
                      onClick={() => onAskDelete?.(comment)}
                      className="px-2 py-1 rounded border border-red-300/60 bg-white/40 text-red-800 hover:bg-red-500/10"
                    >
                      Удалить
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-slate-900">{String(comment.content || '')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
