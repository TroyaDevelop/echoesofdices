import NewsItemRow from './NewsItemRow.jsx';

export default function NewsList({
  loading,
  items,
  shouldScroll,
  editingId,
  formatDate,
  onStartEdit,
  onDelete,
  editTitle,
  onEditTitleChange,
  editExcerpt,
  onEditExcerptChange,
  editContent,
  onEditContentChange,
  editStatus,
  onEditStatusChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {loading ? (
        <div className="p-6 text-gray-700">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-gray-700">Новостей пока нет.</div>
      ) : (
        <div className={`divide-y divide-gray-200 ${shouldScroll ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
          {items.map((post) => (
            <NewsItemRow
              key={post.id}
              post={post}
              isEditing={editingId === post.id}
              formatDate={formatDate}
              onStartEdit={onStartEdit}
              onDelete={onDelete}
              editTitle={editTitle}
              onEditTitleChange={onEditTitleChange}
              editExcerpt={editExcerpt}
              onEditExcerptChange={onEditExcerptChange}
              editContent={editContent}
              onEditContentChange={onEditContentChange}
              editStatus={editStatus}
              onEditStatusChange={onEditStatusChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
