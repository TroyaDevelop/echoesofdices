export default function RegionsPanel({
  regionName,
  onRegionNameChange,
  onCreateRegion,
  regions,
  shouldScroll,
  editingRegionId,
  editRegionName,
  onEditRegionNameChange,
  onStartEditRegion,
  onCancelEditRegion,
  onSaveEditRegion,
  onRemoveRegion,
  inputClass,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Регионы</div>

      <form onSubmit={onCreateRegion} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={regionName} onChange={onRegionNameChange} placeholder="Регион" className={inputClass} />
          <div className="flex items-center justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium">
              Добавить регион
            </button>
          </div>
        </div>
      </form>

      {regions.length === 0 ? (
        <div className="text-sm text-gray-600">Регионов пока нет.</div>
      ) : (
        <div className={shouldScroll ? 'max-h-[15rem] overflow-y-auto pr-2' : ''}>
          <div className="divide-y divide-gray-200">
            {regions.map((region) => (
              <div key={region.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{region.name}</div>

                  {editingRegionId === region.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        value={editRegionName}
                        onChange={onEditRegionNameChange}
                        placeholder="Регион"
                        className={inputClass}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSaveEditRegion(region.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEditRegion}
                          className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {editingRegionId === region.id ? null : (
                    <button onClick={() => onStartEditRegion(region)} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                      Редактировать
                    </button>
                  )}
                  <button onClick={() => onRemoveRegion(region.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
