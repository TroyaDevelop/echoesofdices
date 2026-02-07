import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';

const rarityOptions = [
  { value: 'common', label: 'Обычный' },
  { value: 'uncommon', label: 'Необычный' },
  { value: 'rare', label: 'Редкий' },
  { value: 'very_rare', label: 'Очень редкий' },
  { value: 'legendary', label: 'Легендарный' },
  { value: 'artifact', label: 'Артефакт' },
];

export default function WondrousItemEditForm({
  editingKey,
  editName,
  onEditNameChange,
  editNameEn,
  onEditNameEnChange,
  editItemType,
  onEditItemTypeChange,
  editRarity,
  onEditRarityChange,
  editRecommendedCost,
  onEditRecommendedCostChange,
  editRecommendedCostEot,
  onEditRecommendedCostEotChange,
  editAttunementRequired,
  onEditAttunementRequiredChange,
  editAttunementBy,
  onEditAttunementByChange,
  editRarityEot,
  onEditRarityEotChange,
  editSource,
  onEditSourceChange,
  editSourcePages,
  onEditSourcePagesChange,
  editDescription,
  onEditDescriptionChange,
  editHasEotVariant,
  onEditHasEotVariantChange,
  editDescriptionEot,
  onEditDescriptionEotChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm font-semibold text-gray-900">Редактирование</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          placeholder="Название"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editNameEn}
          onChange={(e) => onEditNameEnChange(e.target.value)}
          placeholder="Название (EN) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editItemType}
          onChange={(e) => onEditItemTypeChange(e.target.value)}
          placeholder="Вид предмета (например Чудесный предмет)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-600">Редкость</div>
          <select
            value={editRarity}
            onChange={(e) => onEditRarityChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {rarityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <input
          value={editRecommendedCost}
          onChange={(e) => onEditRecommendedCostChange(e.target.value)}
          placeholder="Рекомендуемая стоимость (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={editAttunementRequired}
            onChange={(e) => onEditAttunementRequiredChange(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          Требуется настройка
        </label>

        <input
          value={editAttunementBy}
          onChange={(e) => onEditAttunementByChange(e.target.value)}
          placeholder="Настройка кем (опционально)"
          disabled={!editAttunementRequired}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
        />

        <input
          value={editSource}
          onChange={(e) => onEditSourceChange(e.target.value)}
          placeholder="Источник (например PH) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editSourcePages}
          onChange={(e) => onEditSourcePagesChange(e.target.value)}
          placeholder="Страницы (например PH14) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-semibold text-gray-900">Описание</div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onEditHasEotVariantChange(false)}
            className={
              editHasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
                : 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
            }
          >
            Оригинал
          </button>
          <button
            type="button"
            onClick={() => onEditHasEotVariantChange(true)}
            className={
              editHasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
                : 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
            }
          >
            EoT
          </button>
        </div>
      </div>
      <SpellDescriptionEditor key={editingKey} value={editDescription} onChange={onEditDescriptionChange} />

      {editHasEotVariant ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-600">Редкость (EoT)</div>
              <select
                value={editRarityEot}
                onChange={(e) => onEditRarityEotChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {rarityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-600">Рекоменд. стоимость (EoT)</div>
              <input
                value={editRecommendedCostEot}
                onChange={(e) => onEditRecommendedCostEotChange(e.target.value)}
                placeholder="Опционально"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-900">Описание (EoT) (опционально)</div>
          <SpellDescriptionEditor value={editDescriptionEot} onChange={onEditDescriptionEotChange} />
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
