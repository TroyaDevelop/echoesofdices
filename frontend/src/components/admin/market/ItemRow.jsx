import PricePreview from './PricePreview.jsx';

export default function ItemRow({
  item,
  isEditing,
  categoryLabel,
  onStartEdit,
  onRemove,
  onSave,
  onCancel,
  categories,
  weaponTypes,
  supportsCombatFields,
  inputClass,
  editName,
  onEditNameChange,
  editCategory,
  onEditCategoryChange,
  editShortDescription,
  onEditShortDescriptionChange,
  editDamage,
  onEditDamageChange,
  editArmorClass,
  onEditArmorClassChange,
  editArmorType,
  onEditArmorTypeChange,
  armorTypes,
  editWeaponType,
  onEditWeaponTypeChange,
  editWeight,
  onEditWeightChange,
  editPriceGp,
  onEditPriceGpChange,
  editPriceSp,
  onEditPriceSpChange,
  editPriceCp,
  onEditPriceCpChange,
}) {
  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="font-semibold text-gray-900 truncate">{item.name}</div>
          <div className="text-xs text-gray-500">Категория: {categoryLabel(item.category)}</div>
          <PricePreview gp={item.price_gp} sp={item.price_sp} cp={item.price_cp} />
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={editName} onChange={onEditNameChange} placeholder="Название" className={inputClass} />

              <select value={editCategory} onChange={onEditCategoryChange} className={inputClass}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Краткое описание</div>
              <textarea
                value={editShortDescription}
                onChange={onEditShortDescriptionChange}
                placeholder="Краткая подсказка для рынка"
                className={`${inputClass} min-h-[84px]`}
              />
            </div>

            {supportsCombatFields(editCategory) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Урон (опционально)</div>
                  <input value={editDamage} onChange={onEditDamageChange} placeholder="например 1к8 рубящее" className={inputClass} />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Класс доспеха (опционально)</div>
                  <input value={editArmorClass} onChange={onEditArmorClassChange} placeholder="например 14 + ЛВК (макс 2)" className={inputClass} />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Тип доспеха (если указан КД)</div>
                  <select
                    value={editArmorType}
                    onChange={onEditArmorTypeChange}
                    className={inputClass}
                    disabled={!String(editArmorClass || '').trim()}
                  >
                    <option value="">—</option>
                    {armorTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-600 mb-1">Категория оружия (только если задан урон)</div>
                  <select
                    value={editWeaponType}
                    onChange={onEditWeaponTypeChange}
                    className={inputClass}
                    disabled={!String(editDamage || '').trim()}
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

            <div>
              <div className="text-xs text-gray-600 mb-1">Вес (опционально)</div>
              <input
                value={editWeight}
                onChange={onEditWeightChange}
                inputMode="decimal"
                placeholder="например 2.5"
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-end">
              <PricePreview gp={editPriceGp} sp={editPriceSp} cp={editPriceCp} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input value={editPriceGp} onChange={onEditPriceGpChange} inputMode="numeric" placeholder="З" className={inputClass} />
              <input value={editPriceSp} onChange={onEditPriceSpChange} inputMode="numeric" placeholder="С" className={inputClass} />
              <input value={editPriceCp} onChange={onEditPriceCpChange} inputMode="numeric" placeholder="М" className={inputClass} />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onSave(item.id)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                Сохранить
              </button>
              <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100">
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {isEditing ? null : (
          <button onClick={() => onStartEdit(item)} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
            Редактировать
          </button>
        )}
        <button onClick={() => onRemove(item.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">
          Удалить
        </button>
      </div>
    </div>
  );
}
