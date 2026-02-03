import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-purple-500/20 text-purple-200' : 'text-slate-200 hover:bg-white/10'
  }`;

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/news" className="text-lg sm:text-xl font-bold tracking-wide">
            <span className="text-purple-300">EOTD20</span> Site
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/news" className={navLinkClass}>
              Новости
            </NavLink>
            <NavLink to="/spells" className={navLinkClass}>
              Заклинания
            </NavLink>
            <Link
              to="/admin"
              className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              Админка
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-400">
          © {new Date().getFullYear()} EOTD20
        </div>
      </footer>
    </div>
  );
}
