export default function WondrousItemsHeader({ query, onQueryChange }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <h1 className="text-2xl font-bold text-gray-900">Чудесные предметы</h1>
      <div className="w-full sm:w-80">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Поиск…"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
