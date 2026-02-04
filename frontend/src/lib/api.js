import { API_URL } from './config.js';

const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const clearAuthState = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
  }

  try {
    window.dispatchEvent(new Event('auth:logout'));
  } catch {
  }
};

const apiClient = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      clearAuthState();
    }

    throw new Error(body.error || body.message || 'API Error');
  }

  return res.json();
};

export const authAPI = {
  login: (login, password) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),
  verify: () => apiClient('/auth/verify'),
  register: (data) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
};

export const adminAPI = {
  listUsers: () => apiClient('/admin/users', { method: 'GET' }),
  setUserRole: (id, role) =>
    apiClient(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id) => apiClient(`/admin/users/${id}`, { method: 'DELETE' }),
  createRegistrationKey: () => apiClient('/admin/registration-keys', { method: 'POST' }),
  listRegistrationKeys: () => apiClient('/admin/registration-keys', { method: 'GET' }),
};

export const newsAPI = {
  list: () => apiClient('/news', { method: 'GET' }),
  listAdmin: () => apiClient('/news/admin', { method: 'GET' }),
  create: (data) => apiClient('/news', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/news/${id}`, { method: 'DELETE' }),
};

export const spellsAPI = {
  list: () => apiClient('/spells', { method: 'GET' }),
  getById: (id) => apiClient(`/spells/${id}`, { method: 'GET' }),
  getLikes: (id) => apiClient(`/spells/${id}/likes`, { method: 'GET' }),
  like: (id) => apiClient(`/spells/${id}/like`, { method: 'POST' }),
  unlike: (id) => apiClient(`/spells/${id}/like`, { method: 'DELETE' }),
  listComments: (id) => apiClient(`/spells/${id}/comments`, { method: 'GET' }),
  addComment: (id, content) =>
    apiClient(`/spells/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  listAdmin: () => apiClient('/spells/admin', { method: 'GET' }),
  create: (data) => apiClient('/spells', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/spells/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/spells/${id}`, { method: 'DELETE' }),
};
