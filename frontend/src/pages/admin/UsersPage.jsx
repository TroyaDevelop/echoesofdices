import { useEffect, useMemo, useState } from 'react';

import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AccessNotice from '../../components/admin/users/AccessNotice.jsx';
import ConfirmDeleteModal from '../../components/admin/users/ConfirmDeleteModal.jsx';
import RegistrationKeysSection from '../../components/admin/users/RegistrationKeysSection.jsx';
import UsersHeader from '../../components/admin/users/UsersHeader.jsx';
import UsersSection from '../../components/admin/users/UsersSection.jsx';
import { adminAPI } from '../../lib/api.js';

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
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, busy: false });

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
      const role = parsed ? String(parsed?.role || '').toLowerCase() : '';
      setCurrentUserRole(role);
      const id = parsed?.id;
      setCurrentUserId(Number.isFinite(Number(id)) ? Number(id) : null);
      if (role !== 'editor') {
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

  const toggleEditor = async (u) => {
    setError('');
    try {
      const nextRole = String(u.role).toLowerCase() === 'editor' ? 'user' : 'editor';
      await adminAPI.setUserRole(u.id, nextRole);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка изменения роли');
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
  const shouldScrollUsers = useMemo(() => visibleUsers.length > 5, [visibleUsers.length]);

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

        {currentUserRole !== 'editor' ? <AccessNotice /> : null}

        {currentUserRole === 'editor' ? (
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

        {currentUserRole === 'editor' ? (
          <UsersSection
            loading={loading}
            users={visibleUsers}
            shouldScroll={shouldScrollUsers}
            formatDate={formatDate}
            onToggleEditor={toggleEditor}
            onAskDelete={askDelete}
          />
        ) : null}
        <ConfirmDeleteModal
          open={deleteModal.open}
          busy={deleteModal.busy}
          userLogin={deleteModal.user?.login || ''}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
