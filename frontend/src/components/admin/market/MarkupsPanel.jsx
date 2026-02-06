export default function MarkupsPanel({
  regions,
  markupRegionId,
  onSelectMarkupRegion,
  markupSeason,
  onSeasonChange,
  categories,
  markupDraft,
  onMarkupDraftChange,
  onReset,
  onSave,
  inputClass,
  shouldScroll,
  seasons,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Наценки по категориям (регион × категория)</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <div className="min-w-0">
          <div className="text-xs text-gray-600 mb-1">Регион</div>
          <select value={markupRegionId} onChange={(e) => onSelectMarkupRegion(e.target.value)} className={inputClass}>
            <option value="">Выберите регион…</option>
            {regions.map((region) => (
              <option key={region.id} value={String(region.id)}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-600 mb-1">Сезон</div>
          <select value={markupSeason} onChange={(e) => onSeasonChange(e.target.value)} className={inputClass}>
            {seasons.map((season) => (
              <option key={season.value} value={season.value}>
                {season.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 flex-wrap">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap"
        >
          Сбросить
        </button>
        <button
          type="button"
          onClick={onSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
        >
          Сохранить
        </button>
      </div>

      <div className={shouldScroll ? 'max-h-[15rem] overflow-y-auto pr-2' : ''}>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.value} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="text-sm text-gray-900">{category.label}</div>
              <div className="flex items-center gap-2">
                <input
                  value={markupDraft?.[category.value] ?? '0'}
                  onChange={(e) => onMarkupDraftChange(category.value, e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                  className={inputClass}
                  disabled={!markupRegionId}
                />
                <div className="text-sm text-gray-600 whitespace-nowrap">%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!markupRegionId ? <div className="text-xs text-gray-500">Выберите регион, чтобы настроить наценки.</div> : null}
    </div>
  );
}
