import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../lib/api.js';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAPI.search(query);
        setResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (url) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'spell': return 'Заклинание';
      case 'trait': return 'Черта';
      case 'wondrous': return 'Предмет';
      case 'bestiary': return 'Бестиарий';
      case 'article': return 'Статья';
      case 'lore': return 'Лор';
      default: return 'Страница';
    }
  };

  return (
    <>
      {/* Hanging Sign */}
      <div className="fixed top-0 right-4 md:right-8 z-40 flex flex-col items-center pointer-events-none">
        {/* Chains */}
        <div className="flex gap-6">
          <div className="w-1 h-6 bg-gradient-to-b from-slate-800 to-slate-600 border-x border-black/50"></div>
          <div className="w-1 h-6 bg-gradient-to-b from-slate-800 to-slate-600 border-x border-black/50"></div>
        </div>
        {/* Sign Board */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto relative group flex items-center justify-center w-16 h-12 bg-[#5c3a21] border-2 border-[#3a2212] rounded-sm shadow-lg hover:bg-[#6b4528] transition-colors origin-top animate-swing"
          style={{
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.3)',
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.2))'
          }}
          aria-label="Поиск по сайту"
          title="Поиск по сайту"
        >
          {/* Wood texture lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)'
          }}></div>
          
          {/* Magnifying Glass Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#e8d5a5] drop-shadow-md relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-950/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по сайту..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Поиск...</div>
              ) : query.length > 0 && query.length < 2 ? (
                <div className="p-8 text-center text-slate-500">Введите хотя бы 2 символа</div>
              ) : results.length === 0 && query.length >= 2 ? (
                <div className="p-8 text-center text-slate-500">Ничего не найдено</div>
              ) : (
                <div className="space-y-1">
                  {results.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleResultClick(item.url)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-slate-200 font-medium group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-sm text-slate-500">{item.subtitle}</div>
                        )}
                      </div>
                      <div className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10">
                        {getTypeLabel(item.type)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
