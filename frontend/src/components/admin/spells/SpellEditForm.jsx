import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import SpellClassesHint from './SpellClassesHint.jsx';
import TokenHint from '../TokenHint.jsx';

export default function SpellEditForm({
  editingKey,
  editName,
  onEditNameChange,
  editNameEn,
  onEditNameEnChange,
  editLevel,
  onEditLevelChange,
  editSchool,
  onEditSchoolChange,
  editTheme,
  onEditThemeChange,
  editCastingTime,
  onEditCastingTimeChange,
  editRangeText,
  onEditRangeTextChange,
  editComponents,
  onEditComponentsChange,
  editDuration,
  onEditDurationChange,
  editClasses,
  onEditClassesChange,
  editSubclasses,
  onEditSubclassesChange,
  classOptions,
  editSource,
  onEditSourceChange,
  sourceListId,
  sourceOptions,
  editSourcePages,
  onEditSourcePagesChange,
  editDescription,
  onEditDescriptionChange,
  editHasEotVariant,
  onEditHasEotVariantChange,
  editDescriptionEot,
  onEditDescriptionEotChange,
  themeOptions,
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

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Уровень</label>
          <input
            type="number"
            min={0}
            max={9}
            value={editLevel}
            onChange={(e) => onEditLevelChange(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <input
          value={editSchool}
          onChange={(e) => onEditSchoolChange(e.target.value)}
          placeholder="Школа (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Стихия/фон</label>
          <select
            value={editTheme}
            onChange={(e) => onEditThemeChange(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {themeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <input
          value={editCastingTime}
          onChange={(e) => onEditCastingTimeChange(e.target.value)}
          placeholder="Время накладывания (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editRangeText}
          onChange={(e) => onEditRangeTextChange(e.target.value)}
          placeholder="Дистанция (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editComponents}
          onChange={(e) => onEditComponentsChange(e.target.value)}
          placeholder="Компоненты (например: В, С, М)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editDuration}
          onChange={(e) => onEditDurationChange(e.target.value)}
          placeholder="Длительность (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editClasses}
          onChange={(e) => onEditClassesChange(e.target.value)}
          placeholder="Классы (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="md:col-span-2">
          <SpellClassesHint value={editClasses} classOptions={classOptions} />
        </div>

        <input
          value={editSubclasses}
          onChange={(e) => onEditSubclassesChange(e.target.value)}
          placeholder="Подклассы (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editSource}
          onChange={(e) => onEditSourceChange(e.target.value)}
          placeholder="Источник (опционально)"
          list={sourceListId}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editSourcePages}
          onChange={(e) => onEditSourcePagesChange(e.target.value)}
          placeholder="Страницы (например PH14) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="md:col-span-2">
          <TokenHint value={editSource} options={sourceOptions} />
        </div>
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
