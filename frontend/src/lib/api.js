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
    ...(options.headers || {}),
  };

  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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

export const userProfileAPI = {
  get: () => apiClient('/users/me', { method: 'GET' }),
  update: (data) => apiClient('/users/me', { method: 'PUT', body: JSON.stringify(data || {}) }),
  listCharacters: () => apiClient('/users/me/characters', { method: 'GET' }),
  createCharacter: (data) => apiClient('/users/me/characters', { method: 'POST', body: JSON.stringify(data || {}) }),
  getCharacter: (id) => apiClient(`/users/me/characters/${id}`, { method: 'GET' }),
  updateCharacter: (id, data) => apiClient(`/users/me/characters/${id}`, { method: 'PUT', body: JSON.stringify(data || {}) }),
  deleteCharacter: (id) => apiClient(`/users/me/characters/${id}`, { method: 'DELETE' }),
  getAwards: () => apiClient('/users/me/awards', { method: 'GET' }),
  getUserAwards: (userId) => apiClient(`/users/${userId}/awards`, { method: 'GET' }),
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
  
  listAwards: () => apiClient('/admin/awards', { method: 'GET' }),
  createAward: (formData) => apiClient('/admin/awards', { method: 'POST', body: formData }),
  updateAward: (id, formData) => apiClient(`/admin/awards/${id}`, { method: 'PUT', body: formData }),
  deleteAward: (id) => apiClient(`/admin/awards/${id}`, { method: 'DELETE' }),
  grantAward: (userId, awardId) =>
    apiClient(`/admin/users/${userId}/awards`, { method: 'POST', body: JSON.stringify({ award_id: awardId }) }),
  revokeAward: (userId, awardId) =>
    apiClient(`/admin/users/${userId}/awards/${awardId}`, { method: 'DELETE' }),
};

export const newsAPI = {
  list: () => apiClient('/news', { method: 'GET' }),
  listAdmin: () => apiClient('/news/admin', { method: 'GET' }),
  create: (data) => apiClient('/news', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/news/${id}`, { method: 'DELETE' }),
};

export const articlesAPI = {
  list: () => apiClient('/articles', { method: 'GET' }),
  getBySlug: (slug) => apiClient(`/articles/${encodeURIComponent(slug)}`, { method: 'GET' }),
  listAdmin: () => apiClient('/articles/admin', { method: 'GET' }),
  create: (data) => apiClient('/articles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/articles/${id}`, { method: 'DELETE' }),
};

export const loreAPI = {
  list: () => apiClient('/lore', { method: 'GET' }),
  getBySlug: (slug) => apiClient(`/lore/${encodeURIComponent(slug)}`, { method: 'GET' }),
  listAdmin: () => apiClient('/lore/admin', { method: 'GET' }),
  listLocations: () => apiClient('/lore/locations', { method: 'GET' }),
  listLocationsAdmin: () => apiClient('/lore/locations/admin', { method: 'GET' }),
  createLocation: (name) =>
    apiClient('/lore/locations', { method: 'POST', body: JSON.stringify({ name }) }),
  removeLocation: (id) => apiClient(`/lore/locations/${id}`, { method: 'DELETE' }),
  create: (data) => apiClient('/lore', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/lore/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/lore/${id}`, { method: 'DELETE' }),
};

export const spellsAPI = {
  list: () => apiClient('/spells', { method: 'GET' }),
  getById: (id) => apiClient(`/spells/${id}`, { method: 'GET' }),
  getLikes: (id) => apiClient(`/spells/${id}/likes`, { method: 'GET' }),
  like: (id) => apiClient(`/spells/${id}/like`, { method: 'POST' }),
  unlike: (id) => apiClient(`/spells/${id}/like`, { method: 'DELETE' }),
  favorite: (id) => apiClient(`/spells/${id}/favorite`, { method: 'POST' }),
  unfavorite: (id) => apiClient(`/spells/${id}/favorite`, { method: 'DELETE' }),
  listFavorites: () => apiClient('/spells/favorites', { method: 'GET' }),
  listComments: (id) => apiClient(`/spells/${id}/comments`, { method: 'GET' }),
  addComment: (id, content) =>
    apiClient(`/spells/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (spellId, commentId) => apiClient(`/spells/${spellId}/comments/${commentId}`, { method: 'DELETE' }),
  listAdmin: () => apiClient('/spells/admin', { method: 'GET' }),
  create: (data) => apiClient('/spells', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/spells/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/spells/${id}`, { method: 'DELETE' }),
};

export const traitsAPI = {
  list: () => apiClient('/traits', { method: 'GET' }),
  getById: (id) => apiClient(`/traits/${id}`, { method: 'GET' }),
  getLikes: (id) => apiClient(`/traits/${id}/likes`, { method: 'GET' }),
  like: (id) => apiClient(`/traits/${id}/like`, { method: 'POST' }),
  unlike: (id) => apiClient(`/traits/${id}/like`, { method: 'DELETE' }),
  listComments: (id) => apiClient(`/traits/${id}/comments`, { method: 'GET' }),
  addComment: (id, content) =>
    apiClient(`/traits/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (traitId, commentId) => apiClient(`/traits/${traitId}/comments/${commentId}`, { method: 'DELETE' }),
  listAdmin: () => apiClient('/traits/admin', { method: 'GET' }),
  create: (data) => apiClient('/traits', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/traits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/traits/${id}`, { method: 'DELETE' }),
};

export const wondrousItemsAPI = {
  list: () => apiClient('/wondrous-items', { method: 'GET' }),
  getById: (id) => apiClient(`/wondrous-items/${id}`, { method: 'GET' }),
  getLikes: (id) => apiClient(`/wondrous-items/${id}/likes`, { method: 'GET' }),
  like: (id) => apiClient(`/wondrous-items/${id}/like`, { method: 'POST' }),
  unlike: (id) => apiClient(`/wondrous-items/${id}/like`, { method: 'DELETE' }),
  listComments: (id) => apiClient(`/wondrous-items/${id}/comments`, { method: 'GET' }),
  addComment: (id, content) =>
    apiClient(`/wondrous-items/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (itemId, commentId) => apiClient(`/wondrous-items/${itemId}/comments/${commentId}`, { method: 'DELETE' }),
  listAdmin: () => apiClient('/wondrous-items/admin', { method: 'GET' }),
  create: (data) => apiClient('/wondrous-items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/wondrous-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/wondrous-items/${id}`, { method: 'DELETE' }),
};

export const spellClassesAPI = {
  list: () => apiClient('/spell-classes', { method: 'GET' }),
  listAdmin: () => apiClient('/spell-classes/admin', { method: 'GET' }),
  create: (name) => apiClient('/spell-classes', { method: 'POST', body: JSON.stringify({ name }) }),
  remove: (id) => apiClient(`/spell-classes/${id}`, { method: 'DELETE' }),
};

export const sourcesAPI = {
  list: () => apiClient('/sources', { method: 'GET' }),
  listAdmin: () => apiClient('/sources/admin', { method: 'GET' }),
  create: (name) => apiClient('/sources', { method: 'POST', body: JSON.stringify({ name }) }),
  remove: (id) => apiClient(`/sources/${id}`, { method: 'DELETE' }),
};

export const marketAPI = {
  list: () => apiClient('/market', { method: 'GET' }),
  listAdmin: () => apiClient('/market/admin', { method: 'GET' }),
  listRegions: () => apiClient('/market/regions', { method: 'GET' }),
  listRegionsAdmin: () => apiClient('/market/regions/admin', { method: 'GET' }),
  listMarkups: (season) => {
    const s = season ? String(season) : '';
    const qs = s ? `?season=${encodeURIComponent(s)}` : '';
    return apiClient(`/market/markups${qs}`, { method: 'GET' });
  },
  listMarkupsAdmin: (season) => {
    const s = season ? String(season) : '';
    const qs = s ? `?season=${encodeURIComponent(s)}` : '';
    return apiClient(`/market/markups/admin${qs}`, { method: 'GET' });
  },
  upsertMarkup: (data) => apiClient('/market/markups', { method: 'PUT', body: JSON.stringify(data) }),
  createRegion: (data) => apiClient('/market/regions', { method: 'POST', body: JSON.stringify(data) }),
  updateRegion: (id, data) => apiClient(`/market/regions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeRegion: (id) => apiClient(`/market/regions/${id}`, { method: 'DELETE' }),
  create: (data) => apiClient('/market', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiClient(`/market/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiClient(`/market/${id}`, { method: 'DELETE' }),
  listTradeLogs: (limit = 200) => apiClient(`/market/trades?limit=${encodeURIComponent(limit)}`, { method: 'GET' }),
  logTrade: (data) => apiClient('/market/trades', { method: 'POST', body: JSON.stringify(data) }),
};
