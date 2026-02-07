import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';

const rarityOptions = [
  { value: 'common', label: 'Обычный' },
  { value: 'uncommon', label: 'Необычный' },
  { value: 'rare', label: 'Редкий' },
  { value: 'very_rare', label: 'Очень редкий' },
  { value: 'legendary', label: 'Легендарный' },
  { value: 'artifact', label: 'Артефакт' },
];

export default function WondrousItemCreateForm({
  name,
  onNameChange,
  nameEn,
  onNameEnChange,
  itemType,
  onItemTypeChange,
  rarity,
  onRarityChange,
  recommendedCost,
  onRecommendedCostChange,
  recommendedCostEot,
  onRecommendedCostEotChange,
  attunementRequired,
  onAttunementRequiredChange,
  attunementBy,
  onAttunementByChange,
  rarityEot,
  onRarityEotChange,
  source,
  onSourceChange,
  sourcePages,
  onSourcePagesChange,
  description,
  onDescriptionChange,
  hasEotVariant,
  onHasEotVariantChange,
  descriptionEot,
  onDescriptionEotChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Добавить предмет</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Название"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={nameEn}
          onChange={(e) => onNameEnChange(e.target.value)}
          placeholder="Название (EN) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={itemType}
          onChange={(e) => onItemTypeChange(e.target.value)}
          placeholder="Вид предмета (например Чудесный предмет)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-600">Редкость</div>
          <select
            value={rarity}
            onChange={(e) => onRarityChange(e.target.value)}
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
          value={recommendedCost}
          onChange={(e) => onRecommendedCostChange(e.target.value)}
          placeholder="Рекомендуемая стоимость (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={attunementRequired}
            onChange={(e) => onAttunementRequiredChange(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          Требуется настройка
        </label>

        <input
          value={attunementBy}
          onChange={(e) => onAttunementByChange(e.target.value)}
          placeholder="Настройка кем (опционально)"
          disabled={!attunementRequired}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
        />

        <input
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Источник (например PH) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={sourcePages}
          onChange={(e) => onSourcePagesChange(e.target.value)}
          placeholder="Страницы (например PH14) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-semibold text-gray-900">Описание</div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onHasEotVariantChange(false)}
            className={
              hasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
                : 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
            }
          >
            Оригинал
          </button>
          <button
            type="button"
            onClick={() => onHasEotVariantChange(true)}
            className={
              hasEotVariant
                ? 'px-3 py-1.5 rounded-md text-sm font-semibold bg-white text-gray-900 shadow-sm'
                : 'px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-white'
            }
          >
            EoT
          </button>
        </div>
      </div>
      <SpellDescriptionEditor value={description} onChange={onDescriptionChange} />

      {hasEotVariant ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-600">Редкость (EoT)</div>
              <select
                value={rarityEot}
                onChange={(e) => onRarityEotChange(e.target.value)}
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
                value={recommendedCostEot}
                onChange={(e) => onRecommendedCostEotChange(e.target.value)}
                placeholder="Опционально"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-900">Описание (EoT) (опционально)</div>
          <SpellDescriptionEditor value={descriptionEot} onChange={onDescriptionEotChange} />
        </div>
      ) : null}

      <div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
          Добавить
        </button>
      </div>
    </form>
  );
}
