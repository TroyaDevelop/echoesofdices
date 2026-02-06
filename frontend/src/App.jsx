import { Routes, Route, Navigate } from 'react-router-dom';

import NewsPage from './pages/NewsPage.jsx';
import SpellsPage from './pages/SpellsPage.jsx';
import SpellDetailPage from './pages/SpellDetailPage.jsx';
import TraitsPage from './pages/TraitsPage.jsx';
import TraitDetailPage from './pages/TraitDetailPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminNewsPage from './pages/admin/NewsPage.jsx';
import AdminSpellsPage from './pages/admin/SpellsPage.jsx';
import AdminTraitsPage from './pages/admin/TraitsPage.jsx';
import AdminUsersPage from './pages/admin/UsersPage.jsx';
import AdminMarketPage from './pages/admin/MarketPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/spells" element={<SpellsPage />} />
      <Route path="/spells/:id" element={<SpellDetailPage />} />
      <Route path="/traits" element={<TraitsPage />} />
      <Route path="/traits/:id" element={<TraitDetailPage />} />
      <Route path="/market" element={<MarketPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/news" element={<AdminNewsPage />} />
      <Route path="/admin/spells" element={<AdminSpellsPage />} />
      <Route path="/admin/traits" element={<AdminTraitsPage />} />
      <Route path="/admin/market" element={<AdminMarketPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />

      <Route path="*" element={<Navigate to="/news" replace />} />
    </Routes>
  );
}
