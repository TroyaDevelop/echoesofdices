import ArticleItemRow from './ArticleItemRow.jsx';

export default function ArticleList({
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
  editSource,
  onEditSourceChange,
  editSourcePages,
  onEditSourcePagesChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {loading ? (
        <div className="p-6 text-gray-700">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-gray-700">Статей пока нет.</div>
      ) : (
        <div className={`divide-y divide-gray-200 ${shouldScroll ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
          {items.map((post) => (
            <ArticleItemRow
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
              editSource={editSource}
              onEditSourceChange={onEditSourceChange}
              editSourcePages={editSourcePages}
              onEditSourcePagesChange={onEditSourcePagesChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
