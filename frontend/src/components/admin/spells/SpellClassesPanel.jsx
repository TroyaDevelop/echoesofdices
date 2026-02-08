export default function SpellClassesPanel({
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  busy,
}) {
  const shouldScroll = items.length > 4;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Классы</div>

      <form onSubmit={onAdd} className="flex flex-col sm:flex-row gap-3">
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Например: Плут"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
        >
          Добавить
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-sm text-gray-600">Классы пока не добавлены.</div>
      ) : (
        <div className={`rounded-lg border border-gray-200 ${shouldScroll ? 'max-h-48 overflow-y-auto' : ''}`}>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="text-gray-800">{item.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Удалить класс ${item.name}`}
                  title="Удалить"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}