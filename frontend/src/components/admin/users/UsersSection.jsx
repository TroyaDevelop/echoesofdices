export default function UsersSection({
  loading,
  users,
  shouldScroll,
  formatDate,
  onToggleEditor,
  onAskDelete,
}) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Пользователи</h2>
        <div className="text-sm text-gray-600 mt-1">Всего: {users.length}</div>
      </div>

      {loading ? (
        <div className="mt-4 text-gray-600">Загрузка…</div>
      ) : users.length === 0 ? (
        <div className="mt-4 text-gray-600">Пока нет пользователей.</div>
      ) : (
        <div className={`mt-4 overflow-x-auto ${shouldScroll ? 'max-h-[15rem] overflow-y-auto' : ''}`}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Логин</th>
                <th className="py-2 pr-4">Ник</th>
                <th className="py-2 pr-4">Роль</th>
                <th className="py-2 pr-4">Создан</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {users.map((user) => {
                const role = String(user.role || '').toLowerCase();
                const isEditor = role === 'editor';

                return (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-medium">{user.login}</td>
                    <td className="py-2 pr-4">{user.nickname || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700">{role || '—'}</span>
                    </td>
                    <td className="py-2 pr-4">{formatDate(user.created_at)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={false}
                          onClick={() => onToggleEditor(user)}
                          className={`px-3 py-1.5 rounded-lg border text-sm ${
                            isEditor
                              ? 'bg-white border-red-200 text-red-700 hover:bg-red-50'
                              : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {isEditor ? 'Забрать editor' : 'Выдать editor'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onAskDelete(user)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-700 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
