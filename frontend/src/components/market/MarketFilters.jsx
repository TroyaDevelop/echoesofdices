const darkSelectOptionStyle = { backgroundColor: '#0b1220', color: '#e2e8f0' };

export default function MarketFilters({
  regions,
  regionId,
  onRegionChange,
  season,
  onSeasonChange,
  filterCategory,
  onCategoryChange,
  categories,
  seasons,
}) {
  return (
    <div className="w-full sm:w-[34rem] flex flex-col sm:flex-row gap-3">
      <select
        value={regionId}
        onChange={(e) => onRegionChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        className="w-full sm:w-56 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {seasons.map((s) => (
          <option key={s.value} value={s.value} style={darkSelectOptionStyle}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ colorScheme: 'dark' }}
        className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
    </div>
  );
}
