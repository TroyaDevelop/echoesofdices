import ItemRow from './ItemRow.jsx';

export default function ItemList({
  loading,
  items,
  filterCategory,
  onFilterCategoryChange,
  categories,
  categoryLabel,
  shouldScroll,
  editingId,
  onStartEdit,
  onRemove,
  onSave,
  onCancel,
  inputClass,
  supportsCombatFields,
  weaponTypes,
  armorTypes,
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-lg font-semibold text-gray-900">Список предметов</div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterCategory}
              onChange={onFilterCategoryChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-6 text-gray-700">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-gray-700">Предметов пока нет.</div>
        ) : (
          <div className={shouldScroll ? 'max-h-[28rem] overflow-y-auto' : ''}>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  categoryLabel={categoryLabel}
                  onStartEdit={onStartEdit}
                  onRemove={onRemove}
                  onSave={onSave}
                  onCancel={onCancel}
                  categories={categories}
                  weaponTypes={weaponTypes}
                  armorTypes={armorTypes}
                  supportsCombatFields={supportsCombatFields}
                  inputClass={inputClass}
                  editName={editName}
                  onEditNameChange={onEditNameChange}
                  editCategory={editCategory}
                  onEditCategoryChange={onEditCategoryChange}
                  editShortDescription={editShortDescription}
                  onEditShortDescriptionChange={onEditShortDescriptionChange}
                  editDamage={editDamage}
                  onEditDamageChange={onEditDamageChange}
                  editArmorClass={editArmorClass}
                  onEditArmorClassChange={onEditArmorClassChange}
                  editArmorType={editArmorType}
                  onEditArmorTypeChange={onEditArmorTypeChange}
                  editWeaponType={editWeaponType}
                  onEditWeaponTypeChange={onEditWeaponTypeChange}
                  editWeight={editWeight}
                  onEditWeightChange={onEditWeightChange}
                  editPriceGp={editPriceGp}
                  onEditPriceGpChange={onEditPriceGpChange}
                  editPriceSp={editPriceSp}
                  onEditPriceSpChange={onEditPriceSpChange}
                  editPriceCp={editPriceCp}
                  onEditPriceCpChange={onEditPriceCpChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
