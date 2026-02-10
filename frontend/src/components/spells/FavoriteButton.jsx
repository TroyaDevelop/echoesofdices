export default function FavoriteButton({ favorited, busy, canFavorite, onToggle }) {
  return (
    <button
      type="button"
      disabled={busy || !canFavorite}
      onClick={onToggle}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-base font-medium transition-colors border ${
        favorited
          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={canFavorite ? (favorited ? 'Убрать из избранного' : 'Добавить в избранное') : 'Войдите, чтобы сохранить'}
      aria-label={canFavorite ? (favorited ? 'Убрать из избранного' : 'Добавить в избранное') : 'Войдите, чтобы сохранить'}
    >
      <span className="text-base">{favorited ? '★' : '☆'}</span>
    </button>
  );
}
