import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import TokenHint from '../TokenHint.jsx';

export default function BackgroundEditForm({
  editingKey,
  editName,
  onEditNameChange,
  editNameEn,
  onEditNameEnChange,
  editSource,
  onEditSourceChange,
  sourceListId,
  sourceOptions,
  editDescription,
  onEditDescriptionChange,
  editSkillProficiencies,
  onEditSkillProficienciesChange,
  editToolProficiencies,
  onEditToolProficienciesChange,
  editEquipment,
  onEditEquipmentChange,
  editFeatureTitle,
  onEditFeatureTitleChange,
  editFeatureDescription,
  onEditFeatureDescriptionChange,
  editPersonalization,
  onEditPersonalizationChange,
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
          placeholder="Источник (опционально)"
          list={sourceListId}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editSkillProficiencies}
          onChange={(e) => onEditSkillProficienciesChange(e.target.value)}
          placeholder="Владение навыками"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editToolProficiencies}
          onChange={(e) => onEditToolProficienciesChange(e.target.value)}
          placeholder="Владение инструментами"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={editEquipment}
          onChange={(e) => onEditEquipmentChange(e.target.value)}
          placeholder="Снаряжение"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="md:col-span-2">
          <TokenHint value={editSource} options={sourceOptions} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-lg font-bold uppercase tracking-wide text-gray-900">Описание</div>
        <SpellDescriptionEditor key={editingKey} value={editDescription} onChange={onEditDescriptionChange} />
      </div>

      <input
        value={editFeatureTitle}
        onChange={(e) => onEditFeatureTitleChange(e.target.value)}
        placeholder="Заголовок умения"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <textarea
        value={editFeatureDescription}
        onChange={(e) => onEditFeatureDescriptionChange(e.target.value)}
        rows={5}
        placeholder="Описание умения"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="space-y-2">
        <div className="text-lg font-bold uppercase tracking-wide text-gray-900">Персонализация</div>
        <SpellDescriptionEditor
          key={`personalization-${editingKey}`}
          value={editPersonalization}
          onChange={onEditPersonalizationChange}
        />
      </div>

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
