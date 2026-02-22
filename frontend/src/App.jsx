import { Routes, Route, Navigate } from 'react-router-dom';

import NewsPage from './pages/NewsPage.jsx';
import SpellsPage from './pages/SpellsPage.jsx';
import SpellDetailPage from './pages/SpellDetailPage.jsx';
import TraitsPage from './pages/TraitsPage.jsx';
import TraitDetailPage from './pages/TraitDetailPage.jsx';
import WondrousItemsPage from './pages/WondrousItemsPage.jsx';
import WondrousItemDetailPage from './pages/WondrousItemDetailPage.jsx';
import BestiaryPage from './pages/BestiaryPage.jsx';
import BestiaryDetailPage from './pages/BestiaryDetailPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticleDetailPage from './pages/ArticleDetailPage.jsx';
import LorePage from './pages/LorePage.jsx';
import LoreDetailPage from './pages/LoreDetailPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FriendProfilePage from './pages/FriendProfilePage.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminNewsPage from './pages/admin/NewsPage.jsx';
import AdminSpellsPage from './pages/admin/SpellsPage.jsx';
import AdminTraitsPage from './pages/admin/TraitsPage.jsx';
import AdminWondrousItemsPage from './pages/admin/WondrousItemsPage.jsx';
import AdminBestiaryPage from './pages/admin/BestiaryPage.jsx';
import AdminArticlesPage from './pages/admin/ArticlesPage.jsx';
import AdminLorePage from './pages/admin/LorePage.jsx';
import AdminUtilitiesPage from './pages/admin/UtilitiesPage.jsx';
import AdminUsersPage from './pages/admin/UsersPage.jsx';
import AdminMarketPage from './pages/admin/MarketPage.jsx';
import AdminScreenEncountersPage from './pages/admin/ScreenEncountersPage.jsx';
import AdminBattleSessionPage from './pages/admin/BattleSessionPage.jsx';
import WordCountPage from './pages/WordCountPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/spells" element={<SpellsPage />} />
      <Route path="/spells/:id" element={<SpellDetailPage />} />
      <Route path="/traits" element={<TraitsPage />} />
      <Route path="/traits/:id" element={<TraitDetailPage />} />
      <Route path="/wondrous-items" element={<WondrousItemsPage />} />
      <Route path="/wondrous-items/:id" element={<WondrousItemDetailPage />} />
      <Route path="/bestiary" element={<BestiaryPage />} />
      <Route path="/bestiary/:id" element={<BestiaryDetailPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/articles/:slug" element={<ArticleDetailPage />} />
      <Route path="/lore" element={<LorePage />} />
      <Route path="/lore/:slug" element={<LoreDetailPage />} />
      <Route path="/market" element={<MarketPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:id" element={<FriendProfilePage />} />
      <Route path="/tools/word-count" element={<WordCountPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/news" element={<AdminNewsPage />} />
      <Route path="/admin/spells" element={<AdminSpellsPage />} />
      <Route path="/admin/traits" element={<AdminTraitsPage />} />
      <Route path="/admin/wondrous-items" element={<AdminWondrousItemsPage />} />
      <Route path="/admin/bestiary" element={<AdminBestiaryPage />} />
      <Route path="/admin/articles" element={<AdminArticlesPage />} />
      <Route path="/admin/lore" element={<AdminLorePage />} />
      <Route path="/admin/utilities" element={<AdminUtilitiesPage />} />
      <Route path="/admin/market" element={<AdminMarketPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/screen/encounters" element={<AdminScreenEncountersPage />} />
      <Route path="/admin/screen/sessions/:id" element={<AdminBattleSessionPage />} />

      <Route path="*" element={<Navigate to="/news" replace />} />
    </Routes>
  );
}
