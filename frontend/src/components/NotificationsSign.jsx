import { useState, useEffect, useRef } from 'react';
import { socialAPI } from '../lib/api.js';

export default function NotificationsSign() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await socialAPI.getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      loadNotifications();
      // Poll every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

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

  const handleReadNotification = async (id) => {
    try {
      await socialAPI.readNotification(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => socialAPI.readNotification(n.id)));
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.is_read);

  if (!localStorage.getItem('user')) return null;

  return (
    <>
      {/* Hanging Sign */}
      <div className="fixed top-0 right-24 md:right-28 z-40 flex flex-col items-center pointer-events-none">
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
          aria-label="Уведомления"
          title="Уведомления"
        >
          {/* Wood texture lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)'
          }}></div>
          
          <div className="relative z-10 text-amber-100/80 group-hover:text-amber-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
              <rect x="3" y="5" width="18" height="14" rx="2" />
            </svg>
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadNotifs.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4 md:pr-8 pointer-events-none">
          <div
            ref={modalRef}
            className="pointer-events-auto w-full max-w-sm bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-lg font-semibold text-slate-100">Уведомления</h3>
              {unreadNotifs.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Очистить все
                </button>
              )}
            </div>

            <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {unreadNotifs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Нет новых уведомлений
                </div>
              ) : (
                unreadNotifs.map(n => (
                  <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <span className="text-sm text-slate-300">
                      {n.type === 'friend_request' && `Пользователь ${n.data.requesterName} хочет добавить вас в соратники.`}
                      {n.type === 'friend_accepted' && `Пользователь ${n.data.friendName} принял вашу заявку в соратники.`}
                    </span>
                    <button onClick={() => handleReadNotification(n.id)} className="text-xs text-purple-400 hover:text-purple-300 whitespace-nowrap mt-1">
                      Ок
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
