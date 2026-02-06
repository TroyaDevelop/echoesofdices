export default function SpellClassesPanel({
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  busy,
}) {
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
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}