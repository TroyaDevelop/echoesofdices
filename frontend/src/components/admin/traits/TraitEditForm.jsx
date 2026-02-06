import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';

export default function TraitEditForm({
  editingKey,
  editName,
  onEditNameChange,
  editNameEn,
  onEditNameEnChange,
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
