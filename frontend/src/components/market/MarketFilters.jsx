const darkSelectOptionStyle = { backgroundColor: '#0b1220', color: '#e2e8f0' };

export default function MarketFilters({
  regions,
  regionId,
  onRegionChange,
  season,
  onSeasonChange,
  showMarkup,
  onShowMarkupChange,
  filterCategory,
  onCategoryChange,
  categories,
  seasons,
}) {
  return (
    <div
      className="w-full sm:w-[34rem] grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr] gap-3 items-center"
    >
      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        className="w-full sm:col-span-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="" style={darkSelectOptionStyle}>
          Все категории
        </option>
        {categories.map((c) => (
          <option key={c.value} value={c.value} style={darkSelectOptionStyle}>
            {c.label}
          </option>
        ))}
      </select>
      <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100">
        <input
          type="checkbox"
          checked={showMarkup}
          onChange={(e) => onShowMarkupChange(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-slate-900/60 text-purple-500 focus:ring-purple-500"
        />
        Наценки EoT
      </label>

      <select
        value={regionId}
        onChange={(e) => onRegionChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        disabled={!showMarkup}
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-opacity duration-200 ${
          showMarkup ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!showMarkup}
      >
        {regions.length === 0 ? (
          <option value="" style={darkSelectOptionStyle}>
            Регионы не настроены
          </option>
        ) : null}
        {regions.map((r) => (
          <option key={r.id} value={String(r.id)} style={darkSelectOptionStyle}>
            {r.name}
          </option>
        ))}
      </select>

      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        disabled={!showMarkup}
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-opacity duration-200 ${
          showMarkup ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!showMarkup}
      >
        {seasons.map((s) => (
          <option key={s.value} value={s.value} style={darkSelectOptionStyle}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
