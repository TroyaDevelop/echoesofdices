import PricePreview from './PricePreview.jsx';

export default function ItemCreateForm({
  name,
  onNameChange,
  category,
  onCategoryChange,
  categories,
  shortDescription,
  onShortDescriptionChange,
  damage,
  onDamageChange,
  armorClass,
  onArmorClassChange,
  weaponType,
  onWeaponTypeChange,
  weaponTypes,
  priceGp,
  onPriceGpChange,
  priceSp,
  onPriceSpChange,
  priceCp,
  onPriceCpChange,
  supportsCombatFields,
  inputClass,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4 self-start h-fit">
      <div className="text-lg font-semibold text-gray-900">Добавить предмет</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={name} onChange={onNameChange} placeholder="Название" className={inputClass} />

        <select value={category} onChange={onCategoryChange} className={inputClass}>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Краткое описание (показывается подсказкой на рынке)</div>
        <textarea
          value={shortDescription}
          onChange={onShortDescriptionChange}
          placeholder="Например: лёгкий, складной, выдаёт преимущество в…"
          className={`${inputClass} min-h-[84px]`}
        />
      </div>

      {supportsCombatFields(category) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Урон (опционально)</div>
            <input value={damage} onChange={onDamageChange} placeholder="например 1к8 рубящее" className={inputClass} />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Класс доспеха (опционально)</div>
            <input value={armorClass} onChange={onArmorClassChange} placeholder="например 14 + ЛВК (макс 2)" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-600 mb-1">Категория оружия (только если задан урон)</div>
            <select
              value={weaponType}
              onChange={onWeaponTypeChange}
              className={inputClass}
              disabled={!String(damage || '').trim()}
            >
              <option value="">—</option>
              {weaponTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <PricePreview gp={priceGp} sp={priceSp} cp={priceCp} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input value={priceGp} onChange={onPriceGpChange} inputMode="numeric" placeholder="З" className={inputClass} />
        <input value={priceSp} onChange={onPriceSpChange} inputMode="numeric" placeholder="С" className={inputClass} />
        <input value={priceCp} onChange={onPriceCpChange} inputMode="numeric" placeholder="М" className={inputClass} />
      </div>

      <div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
          Создать
        </button>
      </div>
    </form>
  );
}
