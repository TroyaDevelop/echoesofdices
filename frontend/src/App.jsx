import { Routes, Route, Navigate } from 'react-router-dom';

import NewsPage from './pages/NewsPage.jsx';
import SpellsPage from './pages/SpellsPage.jsx';
import SpellDetailPage from './pages/SpellDetailPage.jsx';
import AdminLoginPage from './pages/admin/LoginPage.jsx';
import RegisterEditorPage from './pages/admin/RegisterEditorPage.jsx';
import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminNewsPage from './pages/admin/NewsPage.jsx';
import AdminSpellsPage from './pages/admin/SpellsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/spells" element={<SpellsPage />} />
      <Route path="/spells/:id" element={<SpellDetailPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<RegisterEditorPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/news" element={<AdminNewsPage />} />
      <Route path="/admin/spells" element={<AdminSpellsPage />} />

      <Route path="*" element={<Navigate to="/news" replace />} />
    </Routes>
  );
}
