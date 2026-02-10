export default function LikeButton({ liked, count, busy, canLike, onToggle }) {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className={`px-3 py-1.5 rounded-md border text-sm transition-colors shadow-sm ${
        liked ? 'bg-pink-600/15 border-pink-700/30 text-pink-900' : 'bg-white/60 border-black/20 text-slate-900'
      }`}
      title={canLike ? 'Поставить/снять лайк' : 'Войдите, чтобы лайкнуть'}
    >
      {liked ? '♥' : '♡'} {safeCount}
    </button>
  );
}
