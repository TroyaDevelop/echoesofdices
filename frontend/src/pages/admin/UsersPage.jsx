import { useEffect, useMemo, useState } from 'react';

import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AccessNotice from '../../components/admin/users/AccessNotice.jsx';
import ConfirmDeleteModal from '../../components/admin/users/ConfirmDeleteModal.jsx';
import RegistrationKeysSection from '../../components/admin/users/RegistrationKeysSection.jsx';
import UsersHeader from '../../components/admin/users/UsersHeader.jsx';
import UsersSection from '../../components/admin/users/UsersSection.jsx';
import UserAwardsModal from '../../components/admin/awards/UserAwardsModal.jsx';
import { adminAPI } from '../../lib/api.js';
import { canManageUsers } from '../../lib/permissions.js';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value || '');
  }
};

export default function AdminUsersPage() {
  const [canManage, setCanManage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, busy: false });
  const [awardsUser, setAwardsUser] = useState(null);
  const [blockedFilter, setBlockedFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [registeredFrom, setRegisteredFrom] = useState('');
  const [registeredTo, setRegisteredTo] = useState('');

  const loadAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [keysData, usersData] = await Promise.all([adminAPI.listRegistrationKeys(), adminAPI.listUsers()]);
      setKeys(Array.isArray(keysData) ? keysData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      setCanManage(canManageUsers(parsed));
      const id = parsed?.id;
      setCurrentUserId(Number.isFinite(Number(id)) ? Number(id) : null);
      if (!canManageUsers(parsed)) {
        setLoading(false);
        return;
      }
    } catch {
      setLoading(false);
      return;
    }

    loadAll();
  }, []);

  const createKey = async () => {
    setError('');
    setCreatingKey(true);
    try {
      await adminAPI.createRegistrationKey();
      await loadAll();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка создания ключа');
    } finally {
      setCreatingKey(false);
    }
  };

  const updateUserFlags = async (u, nextFlags) => {
    setError('');
    try {
      await adminAPI.setUserFlags(u.id, nextFlags);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, flags: nextFlags, flag_admin: nextFlags.admin ? 1 : 0, flag_editor: nextFlags.editor ? 1 : 0, flag_master: nextFlags.master ? 1 : 0 } : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка изменения флагов');
    }
  };

  const unlockUser = async (u) => {
    setError('');
    try {
      await adminAPI.unlockUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id
        ? { ...x, is_blocked: 0, failed_login_attempts: 0, blocked_at: null }
        : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка разблокировки пользователя');
    }
  };

  const activeKeys = useMemo(() => keys.filter((k) => Number(k.is_active) === 1 && !k.used_at), [keys]);
  const shouldScrollKeys = useMemo(() => keys.length > 5, [keys.length]);
  const visibleUsers = useMemo(() => {
    const hiddenLogins = new Set(['echoesroot']);
    return (users || []).filter((u) => {
      const id = Number(u?.id);
      const login = String(u?.login || '').trim();
      if (login && hiddenLogins.has(login)) return false;
      if (Number.isFinite(Number(currentUserId)) && Number.isFinite(id) && id === Number(currentUserId)) return false;
      return true;
    });
  }, [users, currentUserId]);

  const filteredUsers = useMemo(() => {
    const toBool = (value) => value === true || value === 1 || String(value || '').toLowerCase() === 'true';
    const fromTs = registeredFrom ? new Date(`${registeredFrom}T00:00:00`).getTime() : null;
    const toTs = registeredTo ? new Date(`${registeredTo}T23:59:59.999`).getTime() : null;

    return visibleUsers.filter((u) => {
      const isBlocked = toBool(u?.is_blocked);
      const isAdmin = toBool(u?.flag_admin ?? u?.flags?.admin);
      const isEditor = toBool(u?.flag_editor ?? u?.flags?.editor);
      const isMaster = toBool(u?.flag_master ?? u?.flags?.master);

      if (blockedFilter === 'blocked' && !isBlocked) return false;
      if (blockedFilter === 'active' && isBlocked) return false;

      if (roleFilter === 'admin' && !isAdmin) return false;
      if (roleFilter === 'editor' && !isEditor) return false;
      if (roleFilter === 'master' && !isMaster) return false;
      if (roleFilter === 'user' && (isAdmin || isEditor || isMaster)) return false;

      if (fromTs !== null || toTs !== null) {
        const createdTs = new Date(u?.created_at).getTime();
        if (!Number.isFinite(createdTs)) return false;
        if (fromTs !== null && createdTs < fromTs) return false;
        if (toTs !== null && createdTs > toTs) return false;
      }

      return true;
    });
  }, [visibleUsers, blockedFilter, roleFilter, registeredFrom, registeredTo]);

  const shouldScrollUsers = useMemo(() => filteredUsers.length > 5, [filteredUsers.length]);

  const askDelete = (u) => {
    setError('');
    setDeleteModal({ open: true, user: u, busy: false });
  };

  const cancelDelete = () => setDeleteModal({ open: false, user: null, busy: false });

  const confirmDelete = async () => {
    const u = deleteModal.user;
    if (!u) return;
    setError('');
    setDeleteModal((p) => ({ ...p, busy: true }));
    try {
      await adminAPI.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setDeleteModal({ open: false, user: null, busy: false });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления пользователя');
      setDeleteModal((p) => ({ ...p, busy: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <UsersHeader />

        {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</div>}

        {!canManage ? <AccessNotice /> : null}

        {canManage ? (
          <RegistrationKeysSection
            activeKeysCount={activeKeys.length}
            creatingKey={creatingKey}
            onCreateKey={createKey}
            loading={loading}
            keys={keys}
            shouldScroll={shouldScrollKeys}
            formatDate={formatDate}
          />
        ) : null}

        {canManage ? (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-800 mb-3">Фильтры пользователей</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="text-sm text-gray-700">
                <span className="block mb-1">По блокировке</span>
                <select
                  value={blockedFilter}
                  onChange={(e) => setBlockedFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="all">Все</option>
                  <option value="active">Только активные</option>
                  <option value="blocked">Только заблокированные</option>
                </select>
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1">По роли</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="all">Все</option>
                  <option value="user">Обычные</option>
                  <option value="admin">Админы</option>
                  <option value="editor">Редакторы</option>
                  <option value="master">Мастера</option>
                </select>
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1">Регистрация от</span>
                <input
                  type="date"
                  value={registeredFrom}
                  onChange={(e) => setRegisteredFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1">Регистрация до</span>
                <input
                  type="date"
                  value={registeredTo}
                  onChange={(e) => setRegisteredTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          </section>
        ) : null}

        {canManage ? (
          <UsersSection
            loading={loading}
            users={filteredUsers}
            shouldScroll={shouldScrollUsers}
            formatDate={formatDate}
            onChangeFlags={updateUserFlags}
            onAskDelete={askDelete}
            onUnlockUser={unlockUser}
            onManageAwards={setAwardsUser}
          />
        ) : null}
        <ConfirmDeleteModal
          open={deleteModal.open}
          busy={deleteModal.busy}
          userLogin={deleteModal.user?.login || ''}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />

        {awardsUser ? (
          <UserAwardsModal user={awardsUser} onClose={() => setAwardsUser(null)} />
        ) : null}
      </div>
    </AdminLayout>
  );
}
