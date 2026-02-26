export default function SpellSchoolsPanel({
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  busy,
}) {
  const shouldScroll = items.length > 4;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4 min-w-0">
      <div className="text-lg font-semibold text-gray-900">Школы заклинаний</div>

      <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start min-w-0">
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Например: Иллюзия"
          className="w-full min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
        >
          Добавить
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-sm text-gray-600">Школы пока не добавлены.</div>
      ) : (
        <div className={`rounded-lg border border-gray-200 min-w-0 ${shouldScroll ? 'max-h-48 overflow-y-auto' : ''}`}>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="text-gray-800 truncate">{item.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Удалить школу ${item.name}`}
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
