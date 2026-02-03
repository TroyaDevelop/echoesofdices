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
  listAdmin: () => apiClient('/spells/admin', { method: 'GET' }),
  create: (data) => apiClient('/spells', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/spells/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/spells/${id}`, { method: 'DELETE' }),
};
