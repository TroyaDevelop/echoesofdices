const splitTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

export default function SpellClassesHint({ value, classOptions }) {
  const tokens = splitTokens(value);
  if (tokens.length === 0) return null;

  const known = new Set((classOptions || []).map((item) => normalizeKey(item.name ?? item)));

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tokens.map((token) => {
        const exists = known.has(normalizeKey(token));
        return (
          <span
            key={`${token}-${exists ? 'ok' : 'bad'}`}
            className={
              exists
                ? 'px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200'
            }
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}