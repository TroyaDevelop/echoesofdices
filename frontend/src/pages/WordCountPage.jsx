import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import { toolsAPI } from '../lib/api.js';

export default function WordCountPage() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [spellErrors, setSpellErrors] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\s/g, '').length;
    setStats({ words, chars });

    const timer = setTimeout(async () => {
      if (!text.trim()) {
        setSpellErrors([]);
        return;
      }
      setIsChecking(true);
      try {
        const data = await toolsAPI.spellcheck(text);
        setSpellErrors(Array.isArray(data?.errors) ? data.errors : []);
      } catch (e) {
        console.error('Spellcheck error:', e);
        setSpellErrors([]);
      } finally {
        setIsChecking(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Орфограф</h1>
        
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 mb-6 shadow-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст здесь..."
            className="w-full h-96 bg-black/50 border border-white/10 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-y"
            spellCheck="false"
          />
          
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-300 bg-black/30 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Слов:</span>
              <span className="font-mono text-lg text-white">{stats.words}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Символов (без пробелов):</span>
              <span className="font-mono text-lg text-white">{stats.chars}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Ошибок:</span>
              <span className={`font-mono text-lg ${spellErrors.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {isChecking ? '...' : spellErrors.length}
              </span>
            </div>
          </div>
        </div>

        {spellErrors.length > 0 && (
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-red-200 mb-3">Ошибки орфографии и пунктуации:</h2>
            <div className="space-y-2">
              {spellErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm bg-black/20 p-2 rounded border border-red-900/20">
                  <div className="text-red-300 font-medium line-through decoration-red-500/50">{err.word || 'фрагмент текста'}</div>
                  <div className="text-slate-400">→</div>
                  <div className="text-emerald-300 flex-1">
                    {err.s?.length > 0 ? err.s.join(', ') : <span className="text-slate-500 italic">вариант исправления не предложен</span>}
                    {err.message ? <div className="text-slate-400 mt-1">{err.message}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
