import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';
import SpellClassesHint from './SpellClassesHint.jsx';
import TokenHint from '../TokenHint.jsx';

export default function SpellCreateForm({
  name,
  onNameChange,
  nameEn,
  onNameEnChange,
  level,
  onLevelChange,
  school,
  onSchoolChange,
  theme,
  onThemeChange,
  castingTime,
  onCastingTimeChange,
  rangeText,
  onRangeTextChange,
  components,
  onComponentsChange,
  duration,
  onDurationChange,
  classes,
  onClassesChange,
  subclasses,
  onSubclassesChange,
  classOptions,
  source,
  onSourceChange,
  sourceListId,
  sourceOptions,
  sourcePages,
  onSourcePagesChange,
  description,
  onDescriptionChange,
  hasEotVariant,
  onHasEotVariantChange,
  descriptionEot,
  onDescriptionEotChange,
  themeOptions,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="text-lg font-semibold text-gray-900">Добавить заклинание</div>

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

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Уровень</label>
          <input
            type="number"
            min={0}
            max={9}
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <input
          value={school}
          onChange={(e) => onSchoolChange(e.target.value)}
          placeholder="Школа (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Стихия/фон</label>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
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
          value={castingTime}
          onChange={(e) => onCastingTimeChange(e.target.value)}
          placeholder="Время накладывания (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={rangeText}
          onChange={(e) => onRangeTextChange(e.target.value)}
          placeholder="Дистанция (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={components}
          onChange={(e) => onComponentsChange(e.target.value)}
          placeholder="Компоненты (например: В, С, М)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          placeholder="Длительность (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={classes}
          onChange={(e) => onClassesChange(e.target.value)}
          placeholder="Классы (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="md:col-span-2">
          <SpellClassesHint value={classes} classOptions={classOptions} />
        </div>

        <input
          value={subclasses}
          onChange={(e) => onSubclassesChange(e.target.value)}
          placeholder="Подклассы (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          placeholder="Источник (опционально)"
          list={sourceListId}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          value={sourcePages}
          onChange={(e) => onSourcePagesChange(e.target.value)}
          placeholder="Страницы (например PH14) (опционально)"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="md:col-span-2">
          <TokenHint value={source} options={sourceOptions} />
        </div>
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
