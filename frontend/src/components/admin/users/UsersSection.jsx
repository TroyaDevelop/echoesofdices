export default function UsersSection({
  loading,
  users,
  shouldScroll,
  formatDate,
  onChangeRole,
  onAskDelete,
  onManageAwards,
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

                return (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-medium">{user.login}</td>
                    <td className="py-2 pr-4">{user.nickname || '—'}</td>
                    <td className="py-2 pr-4">
                      <select
                        value={role}
                        onChange={(e) => onChangeRole(user, e.target.value)}
                        className="px-2 py-1 rounded border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="user">Пользователь</option>
                        <option value="editor">Редактор</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4">{formatDate(user.created_at)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onManageAwards(user)}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-sm text-amber-700 hover:bg-amber-50"
                        >
                          Награды
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
