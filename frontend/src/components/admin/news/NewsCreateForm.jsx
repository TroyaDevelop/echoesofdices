import SpellDescriptionEditor from '../SpellDescriptionEditor.jsx';

export default function NewsCreateForm({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  content,
  onContentChange,
  status,
  onStatusChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-lg font-semibold text-gray-900">Добавить новость</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Статус</label>
          <select
            value={status}
            onChange={onStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="published">Опубликовано</option>
            <option value="draft">Черновик</option>
          </select>
        </div>
      </div>

      <input
        value={title}
        onChange={onTitleChange}
        placeholder="Заголовок"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <input
        value={excerpt}
        onChange={onExcerptChange}
        placeholder="Короткое описание (опционально)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <SpellDescriptionEditor value={content} onChange={onContentChange} placeholder="Текст" enableTables={false} />

      <div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
          Создать
        </button>
      </div>
    </form>
  );
}
