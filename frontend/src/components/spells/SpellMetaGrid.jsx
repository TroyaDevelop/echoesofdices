const field = (value) => {
  const s = String(value ?? '').trim();
  return s ? s : '—';
};

export default function SpellMetaGrid({ spell }) {
  return (
    <div className="px-4 sm:px-6 py-3 space-y-1 text-[15px]">
      <div>
        <span className="font-semibold">Время накладывания:</span> {field(spell?.casting_time)}
      </div>
      <div>
        <span className="font-semibold">Дистанция:</span> {field(spell?.range_text)}
      </div>
      <div>
        <span className="font-semibold">Компоненты:</span> {field(spell?.components)}
      </div>
      <div>
        <span className="font-semibold">Длительность:</span> {field(spell?.duration)}
      </div>
      <div>
        <span className="font-semibold">Классы:</span> {field(spell?.classes)}
      </div>
      <div>
        <span className="font-semibold">Подклассы:</span> {field(spell?.subclasses)}
      </div>
    </div>
  );
}
