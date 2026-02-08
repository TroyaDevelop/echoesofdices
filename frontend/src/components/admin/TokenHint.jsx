const splitTokens = (value) =>
  String(value || '')
    .split(/[,;/]+/)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const toOptionName = (item) => {
  if (item && typeof item === 'object') return item.name;
  return item;
};

export default function TokenHint({ value, options }) {
  const tokens = splitTokens(value);
  if (tokens.length === 0) return null;

  const known = new Set((options || []).map((item) => normalizeKey(toOptionName(item))));

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
